import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { BalanceSummarySchema, BalanceEntrySchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { balanceEntries } from '../../db/schema/balance.js';
import { getBalanceSummary } from '../../services/balance.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

const HistoryQuery = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) });

export async function kidBalanceRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/kid/balance',
    { preHandler: app.requireKid, schema: { response: { 200: BalanceSummarySchema } } },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      return (await getBalanceSummary(kid.id)) as never;
    },
  );

  r.get(
    '/kid/history',
    {
      preHandler: app.requireKid,
      schema: { querystring: HistoryQuery, response: { 200: z.array(BalanceEntrySchema) } },
    },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      const rows = await getDb()
        .select()
        .from(balanceEntries)
        .where(eq(balanceEntries.kidId, kid.id))
        .orderBy(desc(balanceEntries.createdAt))
        .limit(req.query.limit);
      return rows.map((row) => ({
        id: row.id,
        kidId: row.kidId,
        amountCents: row.amountCents,
        reason: row.reason,
        referenceId: row.referenceId,
        referenceTitle: row.referenceTitle,
        note: row.note,
        createdBy: row.createdBy,
        createdAt: row.createdAt.toISOString(),
      })) as never;
    },
  );
}
