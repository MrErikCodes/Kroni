import { and, eq, isNotNull, lt, sql } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { households } from '../db/schema/households.js';
import { parents } from '../db/schema/parents.js';
import { kids } from '../db/schema/kids.js';
import { tasks } from '../db/schema/tasks.js';
import { rewards } from '../db/schema/rewards.js';
import { logger } from '../lib/logger.js';

// Cron 0 4 * * * Europe/Oslo. Hard-deletes households that have been
// empty (no parents AND no kids) for at least COOLDOWN_DAYS. Cooldown
// guards against accidental Clerk deletions and re-invite races. Cascade
// FKs on tasks/rewards/kids/pairing_codes/household_invites do the rest;
// kids' own dependents (balance, completions, redemptions, devices,
// installs) cascade transitively.
//
// Idempotent: emptied_at is only stamped when zero parents remain (clerk
// webhook) and is cleared on rejoin. A partially-failed run is safe —
// the next pass re-evaluates membership inside the per-row tx.
const COOLDOWN_DAYS = 30;

export async function runHouseholdReaper(): Promise<void> {
  const db = getDb();
  const cutoff = sql`now() - interval '${sql.raw(String(COOLDOWN_DAYS))} days'`;

  const candidates = await db
    .select({ id: households.id })
    .from(households)
    .where(and(isNotNull(households.emptiedAt), lt(households.emptiedAt, cutoff)));

  if (candidates.length === 0) {
    logger.info('household-reaper: nothing to reap');
    return;
  }

  let reapedCount = 0;
  for (const { id: householdId } of candidates) {
    try {
      const ok = await db.transaction(async (tx) => {
        // Lock the row + re-check inside the tx (a parent may have rejoined).
        const locked = await tx
          .select({ id: households.id, emptiedAt: households.emptiedAt })
          .from(households)
          .where(eq(households.id, householdId))
          .for('update')
          .limit(1);
        const hh = locked[0];
        if (!hh || hh.emptiedAt === null) return null;

        const [parentCount] = await tx
          .select({ n: count() })
          .from(parents)
          .where(eq(parents.householdId, householdId));
        if ((parentCount?.n ?? 0) > 0) return null;

        const [kidCount] = await tx
          .select({ n: count() })
          .from(kids)
          .where(eq(kids.householdId, householdId));
        const [taskCount] = await tx
          .select({ n: count() })
          .from(tasks)
          .where(eq(tasks.householdId, householdId));
        const [rewardCount] = await tx
          .select({ n: count() })
          .from(rewards)
          .where(eq(rewards.householdId, householdId));

        const deleted = await tx
          .delete(households)
          .where(eq(households.id, householdId))
          .returning({ id: households.id });
        if (deleted.length === 0) return null;

        return {
          kids: kidCount?.n ?? 0,
          tasks: taskCount?.n ?? 0,
          rewards: rewardCount?.n ?? 0,
        };
      });
      if (ok) {
        reapedCount += 1;
        logger.info(
          {
            householdId,
            kids: ok.kids,
            tasks: ok.tasks,
            rewards: ok.rewards,
          },
          'household-reaper: reaped household',
        );
      }
    } catch (err) {
      logger.error({ err, householdId }, 'household-reaper: reap failed');
    }
  }

  logger.info(
    { candidates: candidates.length, reaped: reapedCount, cooldownDays: COOLDOWN_DAYS },
    'household-reaper done',
  );
}
