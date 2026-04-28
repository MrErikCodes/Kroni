import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids } from '../db/schema/kids.js';
import { ensureTodayCompletions, listTodayTasks } from '../services/tasks.service.js';
import { sendPushToKid } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';

// Cron 5 0 * * * Europe/Oslo. For each kid, idempotently materialize today's
// task_completions rows. Push the kid if they got new tasks (count > 0).
export async function runDailyReset(): Promise<void> {
  const db = getDb();
  const allKids = await db.select({ id: kids.id, name: kids.name, parentId: kids.parentId }).from(kids);
  for (const kid of allKids) {
    try {
      await ensureTodayCompletions(kid.id, kid.parentId);
      const today = await listTodayTasks(kid.id);
      const pending = today.filter((t) => t.status === 'pending').length;
      if (pending > 0) {
        await sendPushToKid(
          kid.id,
          'God morgen!',
          `Hei ${kid.name}, du har ${pending} ${pending === 1 ? 'oppgave' : 'oppgaver'} i dag.`,
          { kind: 'daily-reset', count: pending },
        );
      }
    } catch (err) {
      logger.error({ err, kidId: kid.id }, 'daily-reset kid failed');
    }
  }
  logger.info({ kids: allKids.length }, 'daily-reset done');
}

// Compare with eq import to silence unused.
void eq;
