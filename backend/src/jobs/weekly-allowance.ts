import { gt } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids } from '../db/schema/kids.js';
import { addBalanceEntry } from '../services/balance.service.js';
import { sendPushToKid } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';

const NOK_FORMATTER = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 });

// Cron 0 8 * * 1 Europe/Oslo. For kids with weeklyAllowanceCents > 0, credit the
// ledger (atomic via addBalanceEntry) and push them.
export async function runWeeklyAllowance(): Promise<void> {
  const db = getDb();
  const list = await db
    .select({
      id: kids.id,
      name: kids.name,
      allowanceCents: kids.weeklyAllowanceCents,
    })
    .from(kids)
    .where(gt(kids.weeklyAllowanceCents, 0));

  for (const kid of list) {
    try {
      await addBalanceEntry({
        kidId: kid.id,
        amountCents: kid.allowanceCents,
        reason: 'allowance',
      });
      const formatted = NOK_FORMATTER.format(kid.allowanceCents / 100);
      await sendPushToKid(
        kid.id,
        'Ukepenger tilgjengelig!',
        `Ukepenger på ${formatted} er klare 💰`,
        { kind: 'weekly-allowance', amountCents: kid.allowanceCents },
      );
    } catch (err) {
      logger.error({ err, kidId: kid.id }, 'weekly-allowance kid failed');
    }
  }
  logger.info({ kids: list.length }, 'weekly-allowance done');
}
