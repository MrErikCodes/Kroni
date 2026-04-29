import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq, isNull, or } from 'drizzle-orm';
import { RewardSchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { rewards } from '../../db/schema/rewards.js';
import { requestRedemption } from '../../services/rewards.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

const Params = z.object({ id: z.string().uuid() });

const RedeemResponse = z.object({
  redemptionId: z.string().uuid(),
  rewardId: z.string().uuid(),
  costCents: z.number().int().nonnegative(),
});

export async function kidRewardsRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/kid/rewards',
    { preHandler: app.requireKid, schema: { response: { 200: z.array(RewardSchema) } } },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      const rows = await getDb()
        .select()
        .from(rewards)
        .where(
          and(
            eq(rewards.householdId, kid.householdId),
            eq(rewards.active, true),
            or(eq(rewards.kidId, kid.id), isNull(rewards.kidId)),
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        parentId: row.parentId,
        kidId: row.kidId,
        title: row.title,
        icon: row.icon,
        costCents: row.costCents,
        active: row.active,
        createdAt: row.createdAt.toISOString(),
      })) as never;
    },
  );

  r.post(
    '/kid/rewards/:id/redeem',
    {
      preHandler: app.requireKid,
      schema: { params: Params, response: { 200: RedeemResponse } },
    },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      return requestRedemption({ kidId: kid.id, rewardId: req.params.id });
    },
  );
}
