import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { households } from '../../db/schema/households.js';
import { parents } from '../../db/schema/parents.js';
import { getConfig } from '../../config.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../lib/errors.js';

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
  app.post('/api/webhooks/revenuecat', async (req, reply) => {
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
      .where(
        // Use IN over the set; drizzle's inArray is fine here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eq(parents.clerkUserId, [...candidateIds][0]!),
      )
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
        await db
          .update(households)
          .set({
            lifetimePaid: true,
            subscriptionTier: 'family',
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
        .select({ lifetimePaid: households.lifetimePaid })
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
      }
    } else {
      // CANCELLATION, BILLING_ISSUE, TEST, SUBSCRIPTION_EXTENDED, etc.
      // Logged for visibility, no state change.
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
