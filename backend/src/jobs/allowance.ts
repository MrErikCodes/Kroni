import { eq, and, gt, ne } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids } from '../db/schema/kids.js';
import { addBalanceEntry } from '../services/balance.service.js';
import { sendPushToKid } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';
import {
  isAllowancePayday,
  paidAlreadyToday,
  type AllowancePaydayInput,
} from '../lib/time.js';

const NOK_FORMATTER = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
});

const ALLOWANCE_FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;
type ScheduledFrequency = (typeof ALLOWANCE_FREQUENCIES)[number];

function isScheduledFrequency(value: string): value is ScheduledFrequency {
  return (ALLOWANCE_FREQUENCIES as readonly string[]).includes(value);
}

// Cron 0 8 * * * Europe/Oslo. For every kid with an active schedule, decides
// whether today is a payday using the kid's frequency + day fields and
// allowanceLastPaidAt. Atomic via addBalanceEntry; idempotent via the
// "already paid today" short-circuit.
export async function runAllowance(): Promise<void> {
  const db = getDb();
  const now = new Date();

  const list = await db
    .select({
      id: kids.id,
      name: kids.name,
      frequency: kids.allowanceFrequency,
      amountCents: kids.allowanceCents,
      dayOfWeek: kids.allowanceDayOfWeek,
      dayOfMonth: kids.allowanceDayOfMonth,
      lastPaidAt: kids.allowanceLastPaidAt,
    })
    .from(kids)
    .where(
      and(
        ne(kids.allowanceFrequency, 'none'),
        gt(kids.allowanceCents, 0),
      ),
    );

  let paidCount = 0;
  for (const kid of list) {
    try {
      if (!isScheduledFrequency(kid.frequency)) continue;
      const schedule: AllowancePaydayInput = {
        frequency: kid.frequency,
        dayOfWeek: kid.dayOfWeek,
        dayOfMonth: kid.dayOfMonth,
        lastPaidAt: kid.lastPaidAt,
      };
      if (!isAllowancePayday(schedule, now)) continue;
      if (paidAlreadyToday(kid.lastPaidAt, now)) continue;

      await addBalanceEntry({
        kidId: kid.id,
        amountCents: kid.amountCents,
        reason: 'allowance',
      });
      await db
        .update(kids)
        .set({ allowanceLastPaidAt: now })
        .where(eq(kids.id, kid.id));

      const formatted = NOK_FORMATTER.format(kid.amountCents / 100);
      await sendPushToKid(
        kid.id,
        'Lommepenger tilgjengelig!',
        `Lommepenger på ${formatted} er klare 💰`,
        { kind: 'allowance', amountCents: kid.amountCents, frequency: kid.frequency },
      );
      paidCount++;
    } catch (err) {
      logger.error({ err, kidId: kid.id }, 'allowance kid failed');
    }
  }
  logger.info({ candidates: list.length, paid: paidCount }, 'allowance done');
}
