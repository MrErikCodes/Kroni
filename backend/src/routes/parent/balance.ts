import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import {
  BalanceAdjustSchema,
  BalanceEntrySchema,
  BalanceSummarySchema,
} from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { kids } from '../../db/schema/kids.js';
import { balanceEntries, kidBalances } from '../../db/schema/balance.js';
import {
  addBalanceEntry,
  getBalanceSummary,
  recomputeBalance,
} from '../../services/balance.service.js';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError } from '../../lib/errors.js';

const Params = z.object({ id: z.string().uuid() });

export async function parentBalanceRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  const AdjustResponse = z.object({
    entryId: z.string().uuid(),
    newBalanceCents: z.number().int(),
  });

  r.post(
    '/api/parent/balance/adjust',
    {
      preHandler: app.requireParent,
      schema: { body: BalanceAdjustSchema, response: { 200: AdjustResponse } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const kidRows = await getDb()
        .select({ id: kids.id })
        .from(kids)
        .where(and(eq(kids.id, req.body.kidId), eq(kids.parentId, parent.id)))
        .limit(1);
      if (kidRows.length === 0) throw new BadRequestError('kid not in this household');
      const result = await addBalanceEntry({
        kidId: req.body.kidId,
        amountCents: req.body.amountCents,
        reason: req.body.reason,
        note: req.body.note ?? null,
        createdBy: parent.id,
        preventNegative: true,
      });
      return { entryId: result.entryId, newBalanceCents: result.newBalanceCents };
    },
  );

  const VerifyResponse = z.object({
    kidId: z.string().uuid(),
    materializedBalanceCents: z.number().int(),
    recomputedBalanceCents: z.number().int(),
    matches: z.boolean(),
  });

  r.get(
    '/api/parent/kids/:id/balance/verify',
    {
      preHandler: app.requireParent,
      schema: { params: Params, response: { 200: VerifyResponse } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const ownership = await getDb()
        .select({ id: kids.id })
        .from(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, parent.id)))
        .limit(1);
      if (ownership.length === 0) throw new NotFoundError('kid not found');

      const balRow = await getDb()
        .select()
        .from(kidBalances)
        .where(eq(kidBalances.kidId, req.params.id))
        .limit(1);
      const materialized = balRow[0]?.balanceCents ?? 0;
      const recomputed = await recomputeBalance(req.params.id);
      return {
        kidId: req.params.id,
        materializedBalanceCents: materialized,
        recomputedBalanceCents: recomputed,
        matches: materialized === recomputed,
      };
    },
  );

  const HistoryQuery = z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
  });

  r.get(
    '/api/parent/kids/:id/balance',
    {
      preHandler: app.requireParent,
      schema: { params: Params, response: { 200: BalanceSummarySchema } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const ownership = await getDb()
        .select({ id: kids.id })
        .from(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, parent.id)))
        .limit(1);
      if (ownership.length === 0) throw new NotFoundError('kid not found');
      return (await getBalanceSummary(req.params.id)) as never;
    },
  );

  r.get(
    '/api/parent/kids/:id/history',
    {
      preHandler: app.requireParent,
      schema: {
        params: Params,
        querystring: HistoryQuery,
        response: { 200: z.array(BalanceEntrySchema) },
      },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const ownership = await getDb()
        .select({ id: kids.id })
        .from(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, parent.id)))
        .limit(1);
      if (ownership.length === 0) throw new NotFoundError('kid not found');
      const rows = await getDb()
        .select()
        .from(balanceEntries)
        .where(eq(balanceEntries.kidId, req.params.id))
        .orderBy(desc(balanceEntries.createdAt))
        .limit(req.query.limit);
      return rows.map((row) => ({
        id: row.id,
        kidId: row.kidId,
        amountCents: row.amountCents,
        reason: row.reason,
        referenceId: row.referenceId,
        note: row.note,
        createdBy: row.createdBy,
        createdAt: row.createdAt.toISOString(),
      })) as never;
    },
  );

  void ConflictError; // surface helpful import for future use
}
