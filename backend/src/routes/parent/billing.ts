import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UnauthorizedError } from '../../lib/errors.js';
import { isHouseholdPaid } from '../../services/billing.service.js';

// Status the parent UI consumes — same shape backed by either the
// recurring subscription or the one-time lifetime IAP, so the
// subscription detail screen can render both cases from one read.
const BillingStatusSchema = z.object({
  tier: z.enum(['free', 'family']),
  expiresAt: z.string().datetime().nullable(),
  lifetimePaid: z.boolean(),
  isPaid: z.boolean(),
  // RevenueCat's `period_type` from the most recent grant event. Lets
  // mobile distinguish a real trial (TRIAL) from a near-expiry yearly
  // sub instead of inferring it from a 7-day expiry window. Null when
  // no active sub or for lifetime owners (lifetime isn't periodic).
  periodType: z.enum(['TRIAL', 'INTRO', 'NORMAL']).nullable(),
});

export async function parentBillingRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/parent/billing/status',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: BillingStatusSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      // Whitelist RC's documented period_type values; anything else
      // (including stale rows from before this column existed) → null.
      const rawPeriod = household.subscriptionPeriodType;
      const periodType: 'TRIAL' | 'INTRO' | 'NORMAL' | null =
        rawPeriod === 'TRIAL' || rawPeriod === 'INTRO' || rawPeriod === 'NORMAL'
          ? rawPeriod
          : null;
      return {
        tier: (household.subscriptionTier === 'family' ? 'family' : 'free') as 'free' | 'family',
        expiresAt: household.subscriptionExpiresAt
          ? household.subscriptionExpiresAt.toISOString()
          : null,
        lifetimePaid: household.lifetimePaid,
        isPaid: isHouseholdPaid(household),
        periodType,
      };
    },
  );
}
