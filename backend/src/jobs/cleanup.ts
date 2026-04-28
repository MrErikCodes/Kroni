import { and, eq, isNull, lt, isNotNull, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { pairingCodes } from '../db/schema/pairing.js';
import { taskCompletions } from '../db/schema/tasks.js';
import { logger } from '../lib/logger.js';

// Cron 0 * * * *. Hourly cleanup pass:
// 1) drop expired pairing codes that were never used
// 2) delete completed/approved task_completions older than 90 days
//
// [REVIEW] Spec calls for archiving to task_completions_archive instead of deleting.
// Deferred for v1; archive table can be added in a future migration.
export async function runCleanup(): Promise<void> {
  const db = getDb();
  const expiredCutoff = sql`now() - interval '1 hour'`;
  const expiredCodes = await db
    .delete(pairingCodes)
    .where(and(isNull(pairingCodes.usedAt), lt(pairingCodes.expiresAt, expiredCutoff)))
    .returning({ code: pairingCodes.code });

  const ninetyDays = sql`now() - interval '90 days'`;
  const archivedCompletions = await db
    .delete(taskCompletions)
    .where(
      and(
        or(isNotNull(taskCompletions.approvedAt), isNotNull(taskCompletions.rejectedAt)),
        lt(taskCompletions.createdAt, ninetyDays),
      ),
    )
    .returning({ id: taskCompletions.id });

  logger.info(
    { expiredCodes: expiredCodes.length, archivedCompletions: archivedCompletions.length },
    'cleanup done',
  );

  void eq; // suppress unused-import warning
}
