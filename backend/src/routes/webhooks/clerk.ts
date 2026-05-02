import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { parents } from '../../db/schema/parents.js';
import { households } from '../../db/schema/households.js';
import { processedWebhookEvents } from '../../db/schema/webhook-events.js';
import { ensureHouseholdForParent } from '../../services/household.service.js';
import { getConfig } from '../../config.js';
import { UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import { sendMail, MailpaceError } from '../../lib/mailpace.js';
import {
  loadTemplate,
  isSupportedLocale,
  type SupportedLocale,
} from '../../lib/email-templates.js';

interface ClerkUserCreatedOrUpdated {
  type: 'user.created' | 'user.updated';
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: Record<string, unknown> | null;
  };
}

interface ClerkUserDeleted {
  type: 'user.deleted';
  data: { id: string };
}

// `email.created` fires whenever Clerk would otherwise send a transactional
// email (verification code, magic link, password reset, etc.). The
// `data.slug` field tells us which template Clerk would have used; we
// branch on it to pick our own. The OTP/code lives at `data.data.otp_code`
// — Clerk's outer payload `data` carries the event envelope, and the inner
// `data` block carries the template variables (otp_code, action_url,
// requested_at, app, …). We do NOT fall back to the rendered `data.body`
// HTML — that's Clerk's own email markup and would get embedded as
// `{{code}}` inside our shell, defeating the point of owning the template.
interface ClerkEmailCreated {
  type: 'email.created';
  data: {
    slug?: string;
    to_email_address?: string | null;
    email_address?: string | null;
    user_id?: string | null;
    subject?: string | null;
    data?: Record<string, unknown> | null;
  };
}

type ClerkEvent =
  | ClerkUserCreatedOrUpdated
  | ClerkUserDeleted
  | ClerkEmailCreated
  | { type: string; data: unknown };

// Map a Clerk `email.created` slug to one of our template stems. Returns
// null for slugs we don't own (Clerk will still deliver those itself if
// the dashboard toggle is on; for owned events the dashboard toggle is
// off and we send via Mailpace).
function templateForSlug(slug: string | undefined | null): 'password-reset' | 'email-verification' | null {
  if (!slug) return null;
  if (slug.startsWith('reset_password')) return 'password-reset';
  if (slug === 'verification_code' || slug === 'magic_link_sign_up' || slug === 'magic_link_sign_in') {
    return 'email-verification';
  }
  return null;
}

// Pull the human-visible code/OTP out of an `email.created` payload.
// Clerk puts the template variables for verification_code and
// reset_password_code at `data.data.otp_code`. Returns null if nothing
// OTP-shaped is found; the caller skips the Mailpace send rather than
// embed garbage in the `{{code}}` slot. We deliberately do NOT fall back
// to `data.body` — that field carries Clerk's own rendered HTML, which
// would render-in-render inside our template (the bug that produced the
// nested "Verification code" Clerk block inside our Kroni shell).
function isOtpShaped(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > 128) return false;
  // OTPs and magic-link tokens are short, contiguous strings — no
  // whitespace, no HTML markers. This excludes rendered email bodies
  // without over-constraining future Clerk token shapes.
  return !/[\s<>]/.test(value);
}

function extractCode(data: ClerkEmailCreated['data']): string | null {
  const nested = data.data;
  if (nested && typeof nested === 'object') {
    const otpCode = (nested as { otp_code?: unknown }).otp_code;
    if (isOtpShaped(otpCode)) return otpCode;
  }
  return null;
}

export async function clerkWebhookRoutes(app: FastifyInstance): Promise<void> {
  const cfg = getConfig();
  const wh = new Webhook(cfg.CLERK_WEBHOOK_SECRET);

  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      try {
        done(null, body);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post('/webhooks/clerk', async (req, reply) => {
    const headers = req.headers;
    const id = headers['svix-id'];
    const timestamp = headers['svix-timestamp'];
    const signature = headers['svix-signature'];
    if (typeof id !== 'string' || typeof timestamp !== 'string' || typeof signature !== 'string') {
      throw new UnauthorizedError('missing svix headers');
    }
    if (typeof req.body !== 'string') {
      throw new BadRequestError('expected raw body');
    }
    let event: ClerkEvent;
    try {
      event = wh.verify(req.body, {
        'svix-id': id,
        'svix-timestamp': timestamp,
        'svix-signature': signature,
      }) as ClerkEvent;
    } catch {
      throw new UnauthorizedError('invalid svix signature');
    }

    const db = getDb();
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const ev = event as ClerkUserCreatedOrUpdated;
      const primaryEmailId = ev.data.primary_email_address_id;
      const email = ev.data.email_addresses?.find((e) => e.id === primaryEmailId)?.email_address;
      if (!email) {
        req.log.warn({ clerkUserId: ev.data.id }, 'clerk event missing primary email; skipping');
        return reply.code(202).send({ ok: true, skipped: 'no email' });
      }
      const displayName =
        [ev.data.first_name, ev.data.last_name].filter(Boolean).join(' ') || null;
      const upserted = await db
        .insert(parents)
        .values({ clerkUserId: ev.data.id, email, displayName })
        .onConflictDoUpdate({
          target: parents.clerkUserId,
          set: { email, displayName, updatedAt: new Date() },
        })
        .returning();
      const parent = upserted[0];
      if (parent) {
        // Materialize the household up front so the very next API call from
        // this user finds an established household. Idempotent.
        try {
          await ensureHouseholdForParent(parent);
        } catch (err) {
          logger.error({ err, parentId: parent.id }, 'ensureHouseholdForParent failed in webhook');
        }
      }
      // Welcome email — only on first creation, not user.updated. Failure
      // here MUST NOT trigger Clerk retries (would re-send the welcome
      // email on every retry); we swallow + log + Sentry.
      //
      // Idempotency guard: the upsert above no-ops on retry but we'd still
      // resend the welcome on every retry. Insert into
      // processed_webhook_events keyed on the svix message id; on conflict
      // the event was already handled and we skip the email entirely.
      let alreadyProcessed = false;
      try {
        const insertedEvent = await db
          .insert(processedWebhookEvents)
          .values({ provider: 'clerk', eventId: id })
          .onConflictDoNothing()
          .returning({ eventId: processedWebhookEvents.eventId });
        alreadyProcessed = insertedEvent.length === 0;
      } catch (err) {
        // Don't block the webhook on a dedup-table failure — log and
        // continue. Retries with the same svix-id remain harmless on the
        // upsert above; the worst case is a duplicate welcome email.
        req.log.warn({ err, svix_id: id }, 'clerk dedup insert failed');
      }
      if (event.type === 'user.created' && !alreadyProcessed) {
        const metaLocale = ev.data.public_metadata?.locale;
        const locale: SupportedLocale = isSupportedLocale(metaLocale) ? metaLocale : 'nb-NO';
        const firstName = ev.data.first_name?.trim() || email.split('@')[0] || 'there';
        try {
          const tpl = loadTemplate('welcome', locale, {
            firstName,
            // The welcome email's CTA opens the marketing home rather than
            // a per-user deep link — there's nothing user-specific to
            // resume here, just an invitation to launch the freshly
            // installed app. Universal-link landings live at
            // `https://kroni.no/pair/<code>` (kid share-link) and
            // `https://kroni.no/invite/<code>` (co-parent invite) and are
            // composed by the routes that issue those codes, not by
            // welcome.
            appOpenUrl: 'https://kroni.no',
          });
          await sendMail({
            to: email,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          });
          req.log.info({ clerkUserId: ev.data.id, locale }, 'welcome email sent');
        } catch (err) {
          if (err instanceof MailpaceError) {
            req.log.error(
              { err, status: err.status, body: err.body, clerkUserId: ev.data.id },
              'welcome email send failed (mailpace)',
            );
          } else {
            req.log.error({ err, clerkUserId: ev.data.id }, 'welcome email send failed');
          }
          // Do not rethrow — return 200 below.
        }
      }
      return reply.code(200).send({ ok: true });
    }
    if (event.type === 'email.created') {
      const ev = event as ClerkEmailCreated;
      const stem = templateForSlug(ev.data.slug);
      if (!stem) {
        // Slug we don't own (e.g. organization invite). Acknowledge so
        // Clerk doesn't retry — the dashboard toggle decides whether
        // Clerk delivers it itself.
        return reply.code(200).send({ ok: true, ignored_slug: ev.data.slug ?? null });
      }
      const recipient = ev.data.to_email_address || ev.data.email_address;
      if (!recipient) {
        req.log.warn(
          { slug: ev.data.slug, user_id: ev.data.user_id ?? null },
          'clerk email.created without recipient address; skipping',
        );
        return reply.code(200).send({ ok: true, skipped: 'no recipient' });
      }
      const code = extractCode(ev.data);
      if (code === null) {
        // Skip the send rather than emailing a literal `{{code}}` or
        // (worse) a Clerk-rendered HTML body. Re-enable Clerk's own
        // delivery for this slug in the dashboard if codes start
        // missing in production — this 200 also stops svix retries.
        req.log.error(
          { slug: ev.data.slug, user_id: ev.data.user_id ?? null },
          'clerk email.created had no extractable OTP/token; skipping send',
        );
        return reply.code(200).send({ ok: true, skipped: 'no code' });
      }
      // Resolve recipient locale + display name from `parents` if we have
      // them; otherwise fall back to nb-NO + the email local part.
      let locale: SupportedLocale = 'nb-NO';
      let displayName: string | null = null;
      if (ev.data.user_id) {
        try {
          const [parent] = await db
            .select({ locale: parents.locale, displayName: parents.displayName })
            .from(parents)
            .where(eq(parents.clerkUserId, ev.data.user_id))
            .limit(1);
          if (parent) {
            if (isSupportedLocale(parent.locale)) locale = parent.locale;
            displayName = parent.displayName;
          }
        } catch (err) {
          req.log.warn({ err, user_id: ev.data.user_id }, 'parent lookup failed for email.created');
        }
      }
      const name = displayName?.trim() || recipient.split('@')[0] || 'there';
      try {
        const tpl = loadTemplate(stem, locale, { name, code });
        await sendMail({
          to: recipient,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
        req.log.info(
          { slug: ev.data.slug, stem, locale, user_id: ev.data.user_id ?? null },
          'clerk email.created -> mailpace send accepted',
        );
      } catch (err) {
        if (err instanceof MailpaceError) {
          req.log.error(
            { err, status: err.status, body: err.body, slug: ev.data.slug },
            'clerk email.created send failed (mailpace)',
          );
        } else {
          req.log.error({ err, slug: ev.data.slug }, 'clerk email.created send failed');
        }
        // Swallow: returning 200 below avoids Clerk retries that would
        // re-trigger the same Mailpace send.
      }
      return reply.code(200).send({ ok: true });
    }
    if (event.type === 'user.deleted') {
      const ev = event as ClerkUserDeleted;
      // Delete the parent and stamp emptied_at on any household this was
      // the last parent of. The actual hard-delete of empty households is
      // deferred to backend/src/jobs/household-reaper.ts (daily; cooldown).
      await db.transaction(async (tx) => {
        const removed = await tx
          .delete(parents)
          .where(eq(parents.clerkUserId, ev.data.id))
          .returning({ householdId: parents.householdId });
        const householdId = removed[0]?.householdId;
        if (!householdId) return;
        const remaining = await tx
          .select({ id: parents.id })
          .from(parents)
          .where(eq(parents.householdId, householdId))
          .limit(1);
        if (remaining.length === 0) {
          await tx
            .update(households)
            .set({ emptiedAt: new Date(), updatedAt: new Date() })
            .where(eq(households.id, householdId));
        }
      });
      return reply.code(200).send({ ok: true });
    }
    // Unknown event types are no-ops with 200 to avoid Clerk retries.
    return reply.code(200).send({ ok: true, ignored: event.type });
  });
}
