import { and, eq, isNull, isNotNull, lt, sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { taskCompletions, tasks } from '../db/schema/tasks.js';
import { parents } from '../db/schema/parents.js';
import { parentDevices } from '../db/schema/pairing.js';
import { getRedis } from '../lib/redis.js';
import { sendPushToTokens } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';
import { todayInAppTz } from '../lib/time.js';

// Localized push copy for approval reminders. The backend has no i18n
// framework — keep this inline and keyed off `parents.locale`. nb-NO is
// the default fallback. Mirror of the pattern used in
// routes/webhooks/revenuecat.ts (billingIssueStrings / expirationStrings).
type PushCopy = { title: string; body: string };
type SupportedLocale = 'nb-NO' | 'sv-SE' | 'da-DK' | 'en-US';

function resolveLocale(locale: string | null | undefined): SupportedLocale {
  if (locale === 'sv-SE' || locale === 'da-DK' || locale === 'en-US') return locale;
  if (locale === 'nb-NO') return 'nb-NO';
  if (locale && locale.startsWith('en')) return 'en-US';
  return 'nb-NO';
}

function approvalReminderStrings(
  locale: string | null | undefined,
  pendingCount: number,
): PushCopy {
  switch (resolveLocale(locale)) {
    case 'sv-SE':
      // [REVIEW] sv-SE push copy
      return {
        title: 'Uppgifter väntar på godkännande',
        body:
          pendingCount === 1
            ? 'Ett barn har slutfört en uppgift som väntar på din granskning.'
            : `${pendingCount} uppgifter väntar på din granskning.`,
      };
    case 'da-DK':
      // [REVIEW] da-DK push copy
      return {
        title: 'Opgaver venter på godkendelse',
        body:
          pendingCount === 1
            ? 'Et barn har fuldført en opgave, der venter på din gennemgang.'
            : `${pendingCount} opgaver venter på din gennemgang.`,
      };
    case 'en-US':
      // [REVIEW] en-US push copy
      return {
        title: 'Tasks waiting for approval',
        body:
          pendingCount === 1
            ? 'A child completed a task that is waiting for your review.'
            : `${pendingCount} tasks are waiting for your review.`,
      };
    case 'nb-NO':
    default:
      // [REVIEW] nb-NO push copy
      return {
        title: 'Oppgaver venter på godkjenning',
        body:
          pendingCount === 1
            ? 'Et barn har fullført en oppgave som venter på godkjenning.'
            : `${pendingCount} oppgaver venter på godkjenning.`,
      };
  }
}

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

    // Fan out to every parent in the household. Group push tokens by the
    // parent's preferred locale so each device gets copy in its owner's
    // language. A parent with no registered device contributes 0 tokens
    // and is silently skipped — no failure, just nothing to deliver to.
    const rows = await db
      .select({
        locale: parents.locale,
        pushToken: parentDevices.pushToken,
      })
      .from(parents)
      .innerJoin(parentDevices, eq(parentDevices.parentId, parents.id))
      .where(eq(parents.householdId, householdId));

    const tokensByLocale = new Map<SupportedLocale, string[]>();
    for (const row of rows) {
      if (!row.pushToken) continue;
      const key = resolveLocale(row.locale);
      const bucket = tokensByLocale.get(key) ?? [];
      bucket.push(row.pushToken);
      tokensByLocale.set(key, bucket);
    }

    const totalTokens = [...tokensByLocale.values()].reduce(
      (sum, list) => sum + list.length,
      0,
    );

    if (totalTokens === 0) {
      logger.info(
        { householdId, pendingCount },
        'approval-reminders: no parent devices registered, skipping',
      );
      // Still set the flag so we don't keep recomputing the empty fan-out
      // every 30 minutes for the same household.
      await redis.set(flagKey, '1', 'EX', 26 * 60 * 60);
      continue;
    }

    let delivered = 0;
    let failedLocales = 0;
    for (const [locale, tokens] of tokensByLocale) {
      const { title, body } = approvalReminderStrings(locale, pendingCount);
      try {
        await sendPushToTokens(tokens, title, body, {
          kind: 'approval-reminder',
          householdId,
          pendingCount,
        });
        delivered += tokens.length;
      } catch (err) {
        failedLocales += 1;
        logger.error(
          { err, householdId, locale, tokenCount: tokens.length },
          'approval-reminders: push send failed',
        );
      }
    }

    logger.info(
      {
        householdId,
        pendingCount,
        delivered,
        failedLocales,
        locales: [...tokensByLocale.keys()],
      },
      'approval-reminders: pushed household',
    );

    await redis.set(flagKey, '1', 'EX', 26 * 60 * 60);
  }
}
