import { and, eq, isNull, isNotNull, lt, sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { taskCompletions, tasks } from '../db/schema/tasks.js';
import { parents } from '../db/schema/parents.js';
import { getRedis } from '../lib/redis.js';
import { sendPushToTokens } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';
import { todayInAppTz } from '../lib/time.js';

// Cron */30 * * * *. For households with > 0 pending approvals older than 2h, push.
// Redis flag enforces "max once per day" per household so co-parents share state.
export async function runApprovalReminders(): Promise<void> {
  const db = getDb();
  const redis = getRedis();
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const pendingByHousehold = await db
    .select({
      householdId: tasks.householdId,
      pendingCount: sql<number>`count(*)::int`,
    })
    .from(taskCompletions)
    .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
    .where(
      and(
        isNotNull(taskCompletions.completedAt),
        isNull(taskCompletions.approvedAt),
        isNull(taskCompletions.rejectedAt),
        lt(taskCompletions.completedAt, cutoff),
      ),
    )
    .groupBy(tasks.householdId);

  if (pendingByHousehold.length === 0) {
    logger.info('approval-reminders: nothing pending');
    return;
  }

  const today = todayInAppTz();

  for (const { householdId, pendingCount } of pendingByHousehold) {
    const flagKey = `reminder:sent:${householdId}:${today}`;
    const sent = await redis.get(flagKey);
    if (sent) continue;

    // Find parent push tokens via their kids' devices? No — parents don't have
    // their own device table in v1. Push on parent side is delivered to whatever
    // sessions are signed in via Clerk; for v1 we stub this and log. When the
    // parent device push table is added, swap in here. [TODO household] fan
    // out push to every parent in the household.
    void parents;
    void sendPushToTokens;
    logger.info(
      { householdId, pendingCount },
      'approval-reminders: would push household (parent push wiring deferred)',
    );

    await redis.set(flagKey, '1', 'EX', 26 * 60 * 60);
  }
}
