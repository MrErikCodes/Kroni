import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { parents } from '../../db/schema/parents.js';
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
// branch on it to pick our own. The OTP/code lives at `data.otp` (newer
// payloads); some legacy flows put it at `data.token` or inside a nested
// `data.data.{otp,token}` block. We try them in order and fall back to
// a stringified body if nothing matches so the template still renders
// something visible.
interface ClerkEmailCreated {
  type: 'email.created';
  data: {
    slug?: string;
    to_email_address?: string | null;
    email_address?: string | null;
    user_id?: string | null;
    otp?: string | null;
    token?: string | null;
    body?: string | null;
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
// Clerk's payload shape has shifted between versions — try the most
// common locations in order. Falls back to the rendered `body` string
// (rather than blanking) so a template renders something meaningful
// even if the schema changed underneath us.
function extractCode(data: ClerkEmailCreated['data']): string {
  if (typeof data.otp === 'string' && data.otp.length > 0) return data.otp;
  if (typeof data.token === 'string' && data.token.length > 0) return data.token;
  const nested = data.data;
  if (nested && typeof nested === 'object') {
    const otp = (nested as { otp?: unknown }).otp;
    if (typeof otp === 'string' && otp.length > 0) return otp;
    const token = (nested as { token?: unknown }).token;
    if (typeof token === 'string' && token.length > 0) return token;
  }
  if (typeof data.body === 'string' && data.body.length > 0) return data.body;
  return '';
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
      if (event.type === 'user.created') {
        const metaLocale = ev.data.public_metadata?.locale;
        const locale: SupportedLocale = isSupportedLocale(metaLocale) ? metaLocale : 'nb-NO';
        const firstName = ev.data.first_name?.trim() || email.split('@')[0] || 'there';
        try {
          const tpl = loadTemplate('welcome', locale, {
            firstName,
            // [TODO email] swap in a real universal-link once mobile ships
            // its `/pair` deep-link landing page on kroni.no.
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
      if (!code) {
        // Defensive: log but still attempt to send so the user sees
        // something rather than a silent drop. Templates render `{{code}}`
        // raw if we leave it unsubstituted.
        req.log.warn({ slug: ev.data.slug }, 'clerk email.created had no extractable code');
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
      // Delete the parent row only. Households intentionally have no FK back
      // to parents, so the household survives even if this was the last
      // member — last-member cleanup is a separate concern handled by a
      // future job ([TODO household] reaper for empty households).
      await db.delete(parents).where(eq(parents.clerkUserId, ev.data.id));
      return reply.code(200).send({ ok: true });
    }
    // Unknown event types are no-ops with 200 to avoid Clerk retries.
    return reply.code(200).send({ ok: true, ignored: event.type });
  });
}
