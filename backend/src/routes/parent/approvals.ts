import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq, isNull, isNotNull, desc } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { taskCompletions, tasks } from '../../db/schema/tasks.js';
import { kids } from '../../db/schema/kids.js';
import { rewards, rewardRedemptions } from '../../db/schema/rewards.js';
import { addBalanceEntryInTx } from '../../services/balance.service.js';
import { approveRedemption, rejectRedemption } from '../../services/rewards.service.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors.js';

const Params = z.object({ completionId: z.string().uuid() });

const PendingItem = z.object({
  completionId: z.string().uuid(),
  taskId: z.string().uuid(),
  kidId: z.string().uuid(),
  kidName: z.string(),
  title: z.string(),
  rewardCents: z.number().int(),
  completedAt: z.string(),
});
const PendingRedemption = z.object({
  redemptionId: z.string().uuid(),
  rewardId: z.string().uuid(),
  kidId: z.string().uuid(),
  kidName: z.string(),
  title: z.string(),
  icon: z.string().nullable(),
  costCents: z.number().int(),
  requestedAt: z.string(),
});
const PendingResponse = z.object({
  taskCompletions: z.array(PendingItem),
  rewardRedemptions: z.array(PendingRedemption),
});

export async function parentApprovalsRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/parent/approvals',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: PendingResponse } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const db = getDb();

      const taskRows = await db
        .select({
          completionId: taskCompletions.id,
          taskId: tasks.id,
          kidId: kids.id,
          kidName: kids.name,
          title: tasks.title,
          rewardCents: taskCompletions.rewardCents,
          completedAt: taskCompletions.completedAt,
        })
        .from(taskCompletions)
        .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
        .innerJoin(kids, eq(kids.id, taskCompletions.kidId))
        .where(
          and(
            eq(tasks.householdId, household.id),
            isNotNull(taskCompletions.completedAt),
            isNull(taskCompletions.approvedAt),
            isNull(taskCompletions.rejectedAt),
          ),
        )
        .orderBy(desc(taskCompletions.completedAt));

      const redemptionRows = await db
        .select({
          redemptionId: rewardRedemptions.id,
          rewardId: rewards.id,
          kidId: kids.id,
          kidName: kids.name,
          title: rewards.title,
          icon: rewards.icon,
          costCents: rewardRedemptions.costCents,
          requestedAt: rewardRedemptions.requestedAt,
        })
        .from(rewardRedemptions)
        .innerJoin(rewards, eq(rewards.id, rewardRedemptions.rewardId))
        .innerJoin(kids, eq(kids.id, rewardRedemptions.kidId))
        .where(
          and(
            eq(rewards.householdId, household.id),
            isNull(rewardRedemptions.approvedAt),
            isNull(rewardRedemptions.rejectedAt),
          ),
        )
        .orderBy(desc(rewardRedemptions.requestedAt));

      return {
        taskCompletions: taskRows
          .filter((r) => r.completedAt !== null)
          .map((r) => ({
            completionId: r.completionId,
            taskId: r.taskId,
            kidId: r.kidId,
            kidName: r.kidName,
            title: r.title,
            rewardCents: r.rewardCents,
            completedAt: r.completedAt!.toISOString(),
          })),
        rewardRedemptions: redemptionRows.map((r) => ({
          redemptionId: r.redemptionId,
          rewardId: r.rewardId,
          kidId: r.kidId,
          kidName: r.kidName,
          title: r.title,
          icon: r.icon,
          costCents: r.costCents,
          requestedAt: r.requestedAt.toISOString(),
        })),
      };
    },
  );

  const ApproveResponse = z.object({
    completionId: z.string().uuid(),
    approved: z.literal(true),
    newBalanceCents: z.number().int(),
  });

  r.post(
    '/api/parent/approvals/tasks/:completionId/approve',
    {
      preHandler: app.requireParent,
      schema: { params: Params, response: { 200: ApproveResponse } },
    },
    async (req) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      const db = getDb();

      const result = await db.transaction(async (tx) => {
        const rows = await tx
          .select({ completion: taskCompletions, task: tasks })
          .from(taskCompletions)
          .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
          .where(
            and(
              eq(taskCompletions.id, req.params.completionId),
              eq(tasks.householdId, household.id),
            ),
          )
          .for('update', { of: taskCompletions })
          .limit(1);
        const row = rows[0];
        if (!row) throw new NotFoundError('completion not found');

        if (row.completion.rejectedAt) throw new ConflictError('completion already rejected');
        if (row.completion.approvedAt) {
          // Idempotent: re-approving a previously approved completion is a no-op.
          const balanceRows = await tx
            .select({ amount: taskCompletions.rewardCents })
            .from(taskCompletions)
            .where(eq(taskCompletions.id, row.completion.id))
            .limit(1);
          void balanceRows;
          return { completionId: row.completion.id, newBalanceCents: -1 };
        }

        await tx
          .update(taskCompletions)
          .set({
            approvedAt: new Date(),
            approvedBy: parent.id,
            ...(row.completion.completedAt ? {} : { completedAt: new Date() }),
          })
          .where(eq(taskCompletions.id, row.completion.id));

        const credit = await addBalanceEntryInTx(tx, {
          kidId: row.completion.kidId,
          amountCents: row.completion.rewardCents,
          reason: 'task',
          referenceId: row.completion.id,
          referenceTitle: row.task.title,
          createdBy: parent.id,
        });

        return { completionId: row.completion.id, newBalanceCents: credit.newBalanceCents };
      });

      return { completionId: result.completionId, approved: true as const, newBalanceCents: result.newBalanceCents };
    },
  );

  const RejectResponse = z.object({
    completionId: z.string().uuid(),
    rejected: z.literal(true),
  });

  r.post(
    '/api/parent/approvals/tasks/:completionId/reject',
    {
      preHandler: app.requireParent,
      schema: { params: Params, response: { 200: RejectResponse } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const db = getDb();

      const updated = await db
        .update(taskCompletions)
        .set({ rejectedAt: new Date() })
        .where(
          and(
            eq(taskCompletions.id, req.params.completionId),
            isNull(taskCompletions.approvedAt),
          ),
        )
        .returning({ id: taskCompletions.id, taskId: taskCompletions.taskId });
      const row = updated[0];
      if (!row) throw new ConflictError('cannot reject: not found or already finalized');

      // Verify household ownership post-hoc; if mismatch, undo. (Cleaner: subquery on update.)
      const taskRows = await db
        .select({ id: tasks.id, householdId: tasks.householdId })
        .from(tasks)
        .where(eq(tasks.id, row.taskId))
        .limit(1);
      if (taskRows[0]?.householdId !== household.id) {
        await db
          .update(taskCompletions)
          .set({ rejectedAt: null })
          .where(eq(taskCompletions.id, row.id));
        throw new NotFoundError('completion not found');
      }
      return { completionId: row.id, rejected: true as const };
    },
  );

  const RedemptionParams = z.object({ redemptionId: z.string().uuid() });
  // Mobile clients fire approve/reject without a body. Fastify still
  // schema-validates `req.body`, and a missing body comes through as
  // `null` here — so we have to explicitly accept that, otherwise the
  // request fails with "Expected object, received null". `.nullish()`
  // covers both `null` and `undefined`.
  const RedemptionApproveBody = z
    .object({ note: z.string().max(500).optional() })
    .nullish();
  const RedemptionApproveResponse = z.object({
    redemptionId: z.string().uuid(),
    approved: z.literal(true),
    newBalanceCents: z.number().int(),
  });

  r.post(
    '/api/parent/approvals/rewards/:redemptionId/approve',
    {
      preHandler: app.requireParent,
      schema: {
        params: RedemptionParams,
        body: RedemptionApproveBody,
        response: { 200: RedemptionApproveResponse },
      },
    },
    async (req) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      const out = await approveRedemption({
        redemptionId: req.params.redemptionId,
        householdId: household.id,
        approverParentId: parent.id,
        note: req.body?.note ?? null,
      });
      return { redemptionId: out.redemptionId, approved: true as const, newBalanceCents: out.newBalanceCents };
    },
  );

  const RedemptionRejectResponse = z.object({
    redemptionId: z.string().uuid(),
    rejected: z.literal(true),
  });

  r.post(
    '/api/parent/approvals/rewards/:redemptionId/reject',
    {
      preHandler: app.requireParent,
      schema: {
        params: RedemptionParams,
        body: RedemptionApproveBody,
        response: { 200: RedemptionRejectResponse },
      },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const out = await rejectRedemption({
        redemptionId: req.params.redemptionId,
        householdId: household.id,
        note: req.body?.note ?? null,
      });
      return { redemptionId: out.redemptionId, rejected: true as const };
    },
  );
}
