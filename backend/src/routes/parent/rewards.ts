import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { CreateRewardSchema, UpdateRewardSchema, RewardSchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { rewards } from '../../db/schema/rewards.js';
import { kids } from '../../db/schema/kids.js';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import { serializeReward } from './_serializers.js';

const IdParam = z.object({ id: z.string().uuid() });

async function ensureKidInHousehold(householdId: string, kidId: string): Promise<void> {
  const rows = await getDb()
    .select({ id: kids.id })
    .from(kids)
    .where(and(eq(kids.id, kidId), eq(kids.householdId, householdId)))
    .limit(1);
  if (rows.length === 0) throw new BadRequestError('kid not in this household');
}

export async function parentRewardsRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/parent/rewards',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: z.array(RewardSchema) } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const rows = await getDb().select().from(rewards).where(eq(rewards.householdId, household.id));
      return rows.map(serializeReward);
    },
  );

  r.post(
    '/parent/rewards',
    {
      preHandler: app.requireParent,
      schema: { body: CreateRewardSchema, response: { 201: RewardSchema } },
    },
    async (req, reply) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      if (req.body.kidId) await ensureKidInHousehold(household.id, req.body.kidId);
      const inserted = await getDb()
        .insert(rewards)
        .values({
          householdId: household.id,
          parentId: parent.id,
          kidId: req.body.kidId ?? null,
          title: req.body.title,
          icon: req.body.icon ?? null,
          costCents: req.body.costCents,
          active: req.body.active,
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error('insert failed');
      void reply.code(201);
      return serializeReward(row);
    },
  );

  r.patch(
    '/parent/rewards/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, body: UpdateRewardSchema, response: { 200: RewardSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      if (req.body.kidId) await ensureKidInHousehold(household.id, req.body.kidId);
      const update: Record<string, unknown> = {};
      if (req.body.kidId !== undefined) update.kidId = req.body.kidId;
      if (req.body.title !== undefined) update.title = req.body.title;
      if (req.body.icon !== undefined) update.icon = req.body.icon;
      if (req.body.costCents !== undefined) update.costCents = req.body.costCents;
      if (req.body.active !== undefined) update.active = req.body.active;
      const updated = await getDb()
        .update(rewards)
        .set(update)
        .where(and(eq(rewards.id, req.params.id), eq(rewards.householdId, household.id)))
        .returning();
      const row = updated[0];
      if (!row) throw new NotFoundError('reward not found');
      return serializeReward(row);
    },
  );

  r.delete(
    '/parent/rewards/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const deleted = await getDb()
        .delete(rewards)
        .where(and(eq(rewards.id, req.params.id), eq(rewards.householdId, household.id)))
        .returning({ id: rewards.id });
      if (deleted.length === 0) throw new NotFoundError('reward not found');
      void reply.code(204);
      return null;
    },
  );
}
