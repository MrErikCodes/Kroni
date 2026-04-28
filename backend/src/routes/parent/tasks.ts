import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { CreateTaskSchema, UpdateTaskSchema, TaskSchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { tasks } from '../../db/schema/tasks.js';
import { kids } from '../../db/schema/kids.js';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import { assertCanAddActiveTask } from '../../services/billing.service.js';
import { serializeTask } from './_serializers.js';

const IdParam = z.object({ id: z.string().uuid() });

async function ensureKidInHousehold(householdId: string, kidId: string): Promise<void> {
  const rows = await getDb()
    .select({ id: kids.id })
    .from(kids)
    .where(and(eq(kids.id, kidId), eq(kids.householdId, householdId)))
    .limit(1);
  if (rows.length === 0) throw new BadRequestError('kid not in this household');
}

export async function parentTasksRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/parent/tasks',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: z.array(TaskSchema) } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const rows = await getDb().select().from(tasks).where(eq(tasks.householdId, household.id));
      return rows.map(serializeTask);
    },
  );

  r.post(
    '/api/parent/tasks',
    {
      preHandler: app.requireParent,
      schema: { body: CreateTaskSchema, response: { 201: TaskSchema } },
    },
    async (req, reply) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      if (req.body.kidId) await ensureKidInHousehold(household.id, req.body.kidId);
      if (req.body.active !== false) {
        await assertCanAddActiveTask(household);
      }
      const inserted = await getDb()
        .insert(tasks)
        .values({
          householdId: household.id,
          parentId: parent.id,
          kidId: req.body.kidId ?? null,
          title: req.body.title,
          description: req.body.description ?? null,
          icon: req.body.icon ?? null,
          rewardCents: req.body.rewardCents,
          recurrence: req.body.recurrence,
          daysOfWeek: req.body.daysOfWeek ?? null,
          requiresApproval: req.body.requiresApproval,
          active: req.body.active,
        })
        .returning();
      const task = inserted[0];
      if (!task) throw new Error('insert failed');
      void reply.code(201);
      return serializeTask(task);
    },
  );

  r.patch(
    '/api/parent/tasks/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, body: UpdateTaskSchema, response: { 200: TaskSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      if (req.body.kidId) await ensureKidInHousehold(household.id, req.body.kidId);

      const existingRows = await getDb()
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, req.params.id), eq(tasks.householdId, household.id)))
        .limit(1);
      const existing = existingRows[0];
      if (!existing) throw new NotFoundError('task not found');

      // Gate active-flip-from-false-to-true on the household plan.
      if (req.body.active === true && !existing.active) {
        await assertCanAddActiveTask(household);
      }

      const update: Record<string, unknown> = {};
      if (req.body.kidId !== undefined) update.kidId = req.body.kidId;
      if (req.body.title !== undefined) update.title = req.body.title;
      if (req.body.description !== undefined) update.description = req.body.description;
      if (req.body.icon !== undefined) update.icon = req.body.icon;
      if (req.body.rewardCents !== undefined) update.rewardCents = req.body.rewardCents;
      if (req.body.recurrence !== undefined) update.recurrence = req.body.recurrence;
      if (req.body.daysOfWeek !== undefined) update.daysOfWeek = req.body.daysOfWeek;
      if (req.body.requiresApproval !== undefined) update.requiresApproval = req.body.requiresApproval;
      if (req.body.active !== undefined) update.active = req.body.active;

      const updated = await getDb()
        .update(tasks)
        .set(update)
        .where(and(eq(tasks.id, req.params.id), eq(tasks.householdId, household.id)))
        .returning();
      const task = updated[0];
      if (!task) throw new NotFoundError('task not found');
      return serializeTask(task);
    },
  );

  r.delete(
    '/api/parent/tasks/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const deleted = await getDb()
        .delete(tasks)
        .where(and(eq(tasks.id, req.params.id), eq(tasks.householdId, household.id)))
        .returning({ id: tasks.id });
      if (deleted.length === 0) throw new NotFoundError('task not found');
      void reply.code(204);
      return null;
    },
  );
}
