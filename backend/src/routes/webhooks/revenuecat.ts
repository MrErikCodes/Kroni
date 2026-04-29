import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { households } from '../../db/schema/households.js';
import { parents } from '../../db/schema/parents.js';
import { getConfig } from '../../config.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../lib/errors.js';
import { sendPushToParent } from '../../services/notification.service.js';
import { sendMail, MailpaceError } from '../../lib/mailpace.js';
import {
  loadTemplate,
  isSupportedLocale,
  type SupportedLocale as TemplateLocale,
} from '../../lib/email-templates.js';

// URLs in RC billing emails. The mobile app deep-links these to the
// in-app subscription detail screen on iOS/Android; on the web they
// fall back to kroni.no/account. [TODO email] swap in real
// universal-link landing pages once the website ships them.
const UPDATE_PAYMENT_URL = 'https://kroni.no/account/billing';
const RENEW_URL = 'https://kroni.no/account/billing';

function emailLocale(locale: string | null | undefined): TemplateLocale {
  if (isSupportedLocale(locale)) return locale;
  if (locale && locale.startsWith('en')) return 'en-US';
  return 'nb-NO';
}

async function sendBillingEmail(
  req: FastifyRequest,
  ownerId: string | null,
  template: 'billing-failed' | 'subscription-expired',
  vars: Record<string, string>,
): Promise<void> {
  if (!ownerId) return;
  const db = getDb();
  const [owner] = await db
    .select({
      email: parents.email,
      locale: parents.locale,
      displayName: parents.displayName,
    })
    .from(parents)
    .where(eq(parents.id, ownerId))
    .limit(1);
  if (!owner || !owner.email) {
    req.log.warn(
      { parent_id: ownerId, template },
      'cannot send revenuecat email — parent has no email on record',
    );
    return;
  }
  try {
    const locale = emailLocale(owner.locale);
    const name = owner.displayName?.trim() || owner.email.split('@')[0] || 'there';
    const tpl = loadTemplate(template, locale, { name, ...vars });
    await sendMail({
      to: owner.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    req.log.info({ parent_id: ownerId, template, locale }, 'revenuecat email sent');
  } catch (err) {
    if (err instanceof MailpaceError) {
      req.log.error(
        { err, status: err.status, body: err.body, parent_id: ownerId, template },
        'revenuecat email send failed (mailpace)',
      );
    } else {
      req.log.error({ err, parent_id: ownerId, template }, 'revenuecat email send failed');
    }
    // Swallow — push notification path is independent and runs separately.
  }
}

// Localized push copy for billing events. The backend has no i18n
// framework — keep this inline and keyed off `parents.locale`. nb-NO is
// the default fallback. Mark each entry so a native speaker can polish
// the wording later (push is one-line on lock screens — keep it short).
type PushCopy = { title: string; body: string };
type SupportedLocale = 'nb-NO' | 'sv-SE' | 'da-DK' | 'en-US';

function resolveLocale(locale: string | null | undefined): SupportedLocale {
  if (locale === 'sv-SE' || locale === 'da-DK' || locale === 'en-US') return locale;
  if (locale === 'nb-NO') return 'nb-NO';
  // Anything else (incl. nn-NO, en-GB, …) falls back to en-US.
  if (locale && locale.startsWith('en')) return 'en-US';
  return 'nb-NO';
}

function billingIssueStrings(locale: string | null | undefined): PushCopy {
  switch (resolveLocale(locale)) {
    case 'sv-SE':
      // [REVIEW] sv-SE push copy
      return {
        title: 'Betalningen misslyckades',
        body: 'Vi kunde inte förnya Kroni Family. Uppdatera ditt betalsätt i appen för att inte förlora åtkomst.',
      };
    case 'da-DK':
      // [REVIEW] da-DK push copy
      return {
        title: 'Betalingen mislykkedes',
        body: 'Vi kunne ikke forny Kroni Family. Opdater din betalingsmetode i appen, så du ikke mister adgangen.',
      };
    case 'en-US':
      // [REVIEW] en-US push copy
      return {
        title: 'Payment failed',
        body: "We couldn't renew Kroni Family. Update your payment method in the app to keep your access.",
      };
    case 'nb-NO':
    default:
      // [REVIEW] nb-NO push copy
      return {
        title: 'Betalingen feilet',
        body: 'Vi fikk ikke fornyet Kroni Family. Oppdater betalingsmåten din i appen for å unngå å miste tilgang.',
      };
  }
}

function expirationStrings(locale: string | null | undefined): PushCopy {
  switch (resolveLocale(locale)) {
    case 'sv-SE':
      // [REVIEW] sv-SE push copy
      return {
        title: 'Kroni Family har upphört',
        body: 'Din prenumeration är slut. Förnya i appen för att få tillbaka co-föräldrar och fler barn.',
      };
    case 'da-DK':
      // [REVIEW] da-DK push copy
      return {
        title: 'Kroni Family er udløbet',
        body: 'Dit abonnement er slut. Forny i appen for at få medforældre og flere børn tilbage.',
      };
    case 'en-US':
      // [REVIEW] en-US push copy
      return {
        title: 'Kroni Family has expired',
        body: 'Your subscription ended. Renew in the app to get co-parents and more kids back.',
      };
    case 'nb-NO':
    default:
      // [REVIEW] nb-NO push copy
      return {
        title: 'Kroni Family er utløpt',
        body: 'Abonnementet ditt er over. Forny i appen for å få tilbake co-foreldre og flere barn.',
      };
  }
}

async function notifyOwner(
  req: FastifyRequest,
  householdId: string,
  ownerId: string | null,
  copyFn: (locale: string | null | undefined) => PushCopy,
  data: Record<string, unknown>,
): Promise<void> {
  if (!ownerId) return;
  const db = getDb();
  const [owner] = await db
    .select({ id: parents.id, locale: parents.locale })
    .from(parents)
    .where(eq(parents.id, ownerId))
    .limit(1);
  if (!owner) return;
  try {
    const { title, body } = copyFn(owner.locale);
    await sendPushToParent(owner.id, title, body, data);
  } catch (err) {
    req.log.warn(
      { err, household_id: householdId, parent_id: ownerId },
      'failed to send revenuecat push to owner',
    );
  }
}

// RevenueCat sends one event per state transition. We only care about a
// handful — the rest (TEST, SUBSCRIBER_ALIAS, etc.) we acknowledge and
// drop. The full schema is at:
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
const EventSchema = z.object({
  api_version: z.string().optional(),
  event: z.object({
    type: z.string(),
    id: z.string().optional(),
    app_user_id: z.string().optional(),
    original_app_user_id: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    product_id: z.string().optional(),
    period_type: z.string().optional(),
    expiration_at_ms: z.number().nullable().optional(),
    purchased_at_ms: z.number().optional(),
    environment: z.string().optional(),
    entitlement_ids: z.array(z.string()).nullable().optional(),
  }),
});

const LIFETIME_PRODUCT_IDS = new Set(['kroni_lifetime']);

// Events that grant or extend access. INITIAL_PURCHASE includes the 7-day
// trial (RC sets `period_type: "TRIAL"` + an `expiration_at_ms` ~ 7 days
// out), so trial users are paid customers from the household's POV until
// the trial expires unrenewed.
const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'UNCANCELLATION',
  'TRANSFER', // when a buyer's purchase moves between app_user_ids
]);

// Events that revoke (or are about to). EXPIRATION fires after the grace
// period; CANCELLATION just flips auto-renew off and does NOT revoke
// access while the current period is still valid, so we ignore it.
const REVOKE_EVENTS = new Set(['EXPIRATION']);

function authorized(req: FastifyRequest, expected: string | undefined): boolean {
  if (!expected) {
    // No auth configured — accept everything. Fine in dev; the prod
    // expectation is that REVENUECAT_WEBHOOK_AUTH is set.
    return true;
  }
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return false;
  const value = header.startsWith('Bearer ') ? header.slice(7) : header;
  return value === expected;
}

export async function revenuecatWebhookRoutes(app: FastifyInstance): Promise<void> {
  app.post('/webhooks/revenuecat', async (req, reply) => {
    const cfg = getConfig();
    if (!authorized(req, cfg.REVENUECAT_WEBHOOK_AUTH)) {
      throw new ForbiddenError('invalid revenuecat webhook auth');
    }

    const parsed = EventSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError('malformed webhook payload');
    }
    const ev = parsed.data.event;

    // Resolve the parent. RC's `app_user_id` is set to the Clerk user id
    // by RevenueCatIdentityBridge in mobile. `aliases` covers the case
    // where an anonymous purchase is later transferred to a logged-in
    // account; `original_app_user_id` covers Apple's account-restore.
    const candidateIds = new Set<string>();
    if (ev.app_user_id) candidateIds.add(ev.app_user_id);
    if (ev.original_app_user_id) candidateIds.add(ev.original_app_user_id);
    for (const a of ev.aliases ?? []) candidateIds.add(a);
    if (candidateIds.size === 0) {
      // Anonymous purchase that hasn't been claimed yet — nothing to do.
      req.log.info({ event_type: ev.type }, 'revenuecat event without app_user_id');
      void reply.code(200);
      return { ok: true } as const;
    }

    const db = getDb();
    const [parent] = await db
      .select()
      .from(parents)
      .where(inArray(parents.clerkUserId, [...candidateIds]))
      .limit(1);
    if (!parent || !parent.householdId) {
      // Could be a parent who hasn't completed sign-up yet, or a stale
      // purchase. Acknowledge so RC doesn't retry forever.
      req.log.warn({ event_type: ev.type, candidates: [...candidateIds] }, 'no parent for revenuecat event');
      void reply.code(200);
      return { ok: true } as const;
    }

    const householdId = parent.householdId;
    const isLifetime =
      ev.product_id != null && LIFETIME_PRODUCT_IDS.has(ev.product_id);

    if (GRANT_EVENTS.has(ev.type)) {
      if (isLifetime) {
        // Lifetime is not periodic — clear `subscriptionPeriodType` so a
        // stale TRIAL/NORMAL value can't linger on a household that
        // upgraded from a recurring sub to lifetime.
        await db
          .update(households)
          .set({
            lifetimePaid: true,
            subscriptionTier: 'family',
            subscriptionPeriodType: null,
            premiumOwnerParentId: parent.id,
            updatedAt: new Date(),
          })
          .where(eq(households.id, householdId));
      } else {
        const expiresAt =
          ev.expiration_at_ms != null ? new Date(ev.expiration_at_ms) : null;
        await db
          .update(households)
          .set({
            subscriptionTier: 'family',
            subscriptionExpiresAt: expiresAt,
            subscriptionPeriodType: ev.period_type ?? null,
            premiumOwnerParentId: parent.id,
            updatedAt: new Date(),
          })
          .where(eq(households.id, householdId));
      }
      req.log.info(
        {
          event_type: ev.type,
          parent_id: parent.id,
          household_id: householdId,
          product: ev.product_id,
          period: ev.period_type,
          lifetime: isLifetime,
        },
        'revenuecat grant',
      );
    } else if (REVOKE_EVENTS.has(ev.type)) {
      // Lifetime can't be revoked by an expiration — those events only
      // fire on subscriptions.
      const [row] = await db
        .select({
          lifetimePaid: households.lifetimePaid,
          premiumOwnerParentId: households.premiumOwnerParentId,
        })
        .from(households)
        .where(eq(households.id, householdId))
        .limit(1);
      if (row?.lifetimePaid) {
        req.log.info({ household_id: householdId }, 'expiration ignored — household has lifetime');
      } else {
        await db
          .update(households)
          .set({
            subscriptionTier: 'free',
            subscriptionExpiresAt: null,
            subscriptionPeriodType: null,
            updatedAt: new Date(),
          })
          .where(eq(households.id, householdId));
        req.log.info(
          {
            event_type: ev.type,
            parent_id: parent.id,
            household_id: householdId,
          },
          'revenuecat revoke',
        );
        // Notify the household's premium owner that their subscription
        // expired. Skip silently when no owner is set.
        await notifyOwner(
          req,
          householdId,
          row?.premiumOwnerParentId ?? null,
          expirationStrings,
          { kind: 'revenuecat-expiration' },
        );
        // ALSO send a localized email to the owner's address. Independent
        // try/catch lives inside `sendBillingEmail` — push above is
        // unaffected by email failures and vice versa.
        await sendBillingEmail(
          req,
          row?.premiumOwnerParentId ?? null,
          'subscription-expired',
          { renewUrl: RENEW_URL },
        );
      }
    } else if (ev.type === 'BILLING_ISSUE') {
      // RC fires BILLING_ISSUE when payment fails — access is still valid
      // through the grace period, but the owner needs to update their card.
      // No state change; just push the household's premium owner.
      const [row] = await db
        .select({ premiumOwnerParentId: households.premiumOwnerParentId })
        .from(households)
        .where(eq(households.id, householdId))
        .limit(1);
      req.log.info(
        {
          event_type: ev.type,
          parent_id: parent.id,
          household_id: householdId,
        },
        'revenuecat billing issue',
      );
      await notifyOwner(
        req,
        householdId,
        row?.premiumOwnerParentId ?? null,
        billingIssueStrings,
        { kind: 'revenuecat-billing-issue' },
      );
      // ALSO send a localized email to the owner. Independent of push
      // success — both paths are wrapped in their own try/catch.
      await sendBillingEmail(
        req,
        row?.premiumOwnerParentId ?? null,
        'billing-failed',
        { updatePaymentUrl: UPDATE_PAYMENT_URL },
      );
    } else {
      // CANCELLATION, TEST, SUBSCRIPTION_EXTENDED, etc. Logged for
      // visibility, no state change.
      req.log.info(
        { event_type: ev.type, parent_id: parent.id, household_id: householdId },
        'revenuecat event noted',
      );
    }

    void reply.code(200);
    return { ok: true } as const;
  });

  // Surface NotFoundError (which we don't actually throw above, but
  // referenced for typing of future extensions).
  void NotFoundError;
}
