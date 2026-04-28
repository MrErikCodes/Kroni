import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { TodayTaskSchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { taskCompletions, tasks } from '../../db/schema/tasks.js';
import { addBalanceEntryInTx } from '../../services/balance.service.js';
import { deriveStatus } from '../../services/tasks.service.js';
import { lookup as idemLookup, store as idemStore } from '../../lib/idempotency.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors.js';

const Params = z.object({ completionId: z.string().uuid() });

export async function kidTasksRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    '/api/kid/tasks/:completionId/complete',
    {
      preHandler: app.requireKid,
      schema: { params: Params, response: { 200: TodayTaskSchema } },
    },
    async (req, reply) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      const idemKey = req.headers['idempotency-key'];
      if (typeof idemKey !== 'string' || idemKey.length < 8) {
        throw new BadRequestError('idempotency-key header required');
      }
      const scope = `complete:${kid.id}:${req.params.completionId}`;
      const cached = await idemLookup(idemKey, scope);
      if (cached) {
        void reply.code(cached.status as 200);
        return cached.body as never;
      }

      const db = getDb();
      const result = await db.transaction(async (tx) => {
        const rows = await tx
          .select({ completion: taskCompletions, task: tasks })
          .from(taskCompletions)
          .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
          .where(
            and(
              eq(taskCompletions.id, req.params.completionId),
              eq(taskCompletions.kidId, kid.id),
            ),
          )
          .for('update', { of: taskCompletions })
          .limit(1);
        const row = rows[0];
        if (!row) throw new NotFoundError('completion not found');

        if (row.completion.approvedAt || row.completion.rejectedAt) {
          throw new ConflictError('completion already finalized');
        }
        if (row.completion.completedAt) {
          // Already marked complete (perhaps by retry without idempotency key);
          // surface current state.
          return row;
        }

        const now = new Date();
        const requiresApproval = row.task.requiresApproval;

        await tx
          .update(taskCompletions)
          .set({
            completedAt: now,
            ...(requiresApproval ? {} : { approvedAt: now }),
          })
          .where(eq(taskCompletions.id, row.completion.id));

        if (!requiresApproval) {
          await addBalanceEntryInTx(tx, {
            kidId: kid.id,
            amountCents: row.completion.rewardCents,
            reason: 'task',
            referenceId: row.completion.id,
            referenceTitle: row.task.title,
          });
        }

        const refetched = await tx
          .select({ completion: taskCompletions, task: tasks })
          .from(taskCompletions)
          .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
          .where(eq(taskCompletions.id, row.completion.id))
          .limit(1);
        return refetched[0]!;
      });

      const body = {
        completionId: result.completion.id,
        taskId: result.task.id,
        title: result.task.title,
        description: result.task.description,
        icon: result.task.icon,
        rewardCents: result.task.rewardCents,
        requiresApproval: result.task.requiresApproval,
        recurrence: result.task.recurrence,
        daysOfWeek: result.task.daysOfWeek,
        status: deriveStatus(result.completion),
        completedAt: result.completion.completedAt
          ? result.completion.completedAt.toISOString()
          : null,
      };

      await idemStore(idemKey, scope, { status: 200, body });
      return body as never;
    },
  );

  // Lets the kid undo an accidental "ferdig" tap before a parent has acted on
  // it. Only valid while the completion is in 'completed_pending_approval' —
  // once approved or rejected the balance has moved, so we refuse rather
  // than try to back out the balance entry. Removes the row from the parent
  // approvals queue and returns the completion to 'pending'.
  r.post(
    '/api/kid/tasks/:completionId/uncomplete',
    {
      preHandler: app.requireKid,
      schema: { params: Params, response: { 200: TodayTaskSchema } },
    },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');

      const db = getDb();
      const result = await db.transaction(async (tx) => {
        const rows = await tx
          .select({ completion: taskCompletions, task: tasks })
          .from(taskCompletions)
          .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
          .where(
            and(
              eq(taskCompletions.id, req.params.completionId),
              eq(taskCompletions.kidId, kid.id),
            ),
          )
          .for('update', { of: taskCompletions })
          .limit(1);
        const row = rows[0];
        if (!row) throw new NotFoundError('completion not found');

        if (row.completion.approvedAt || row.completion.rejectedAt) {
          throw new ConflictError('completion already finalized');
        }
        if (!row.completion.completedAt) {
          // Already pending — return current state (idempotent).
          return row;
        }

        await tx
          .update(taskCompletions)
          .set({ completedAt: null })
          .where(eq(taskCompletions.id, row.completion.id));

        const refetched = await tx
          .select({ completion: taskCompletions, task: tasks })
          .from(taskCompletions)
          .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
          .where(eq(taskCompletions.id, row.completion.id))
          .limit(1);
        return refetched[0]!;
      });

      return {
        completionId: result.completion.id,
        taskId: result.task.id,
        title: result.task.title,
        description: result.task.description,
        icon: result.task.icon,
        rewardCents: result.task.rewardCents,
        requiresApproval: result.task.requiresApproval,
        recurrence: result.task.recurrence,
        daysOfWeek: result.task.daysOfWeek,
        status: deriveStatus(result.completion),
        completedAt: result.completion.completedAt
          ? result.completion.completedAt.toISOString()
          : null,
      } as never;
    },
  );
}
