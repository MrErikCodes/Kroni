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
});

export async function parentBillingRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/parent/billing/status',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: BillingStatusSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      return {
        tier: (household.subscriptionTier === 'family' ? 'family' : 'free') as 'free' | 'family',
        expiresAt: household.subscriptionExpiresAt
          ? household.subscriptionExpiresAt.toISOString()
          : null,
        lifetimePaid: household.lifetimePaid,
        isPaid: isHouseholdPaid(household),
      };
    },
  );
}
