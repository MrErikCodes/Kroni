import { Cron } from 'croner';
import { logger } from '../lib/logger.js';
import { closeRedis } from '../lib/redis.js';

import { runDailyReset } from './daily-reset.js';
import { runAllowance } from './allowance.js';
import { runApprovalReminders } from './approval-reminders.js';
import { runCleanup } from './cleanup.js';

const APP_TZ = 'Europe/Oslo';

interface CronJob {
  name: string;
  pattern: string;
  handler: () => Promise<void>;
}

const schedule: CronJob[] = [
  { name: 'daily-reset', pattern: '5 0 * * *', handler: runDailyReset },
  // Daily 08:00 Oslo. Per-kid schedule (weekly / biweekly / monthly) is
  // resolved inside the handler. See jobs/allowance.ts.
  { name: 'allowance', pattern: '0 8 * * *', handler: runAllowance },
  { name: 'approval-reminders', pattern: '*/30 * * * *', handler: runApprovalReminders },
  { name: 'cleanup', pattern: '0 * * * *', handler: runCleanup },
];

async function main(): Promise<void> {
  const jobs: Cron[] = schedule.map((entry) => {
    const job = new Cron(
      entry.pattern,
      { timezone: APP_TZ, protect: true, name: entry.name },
      async () => {
        const startedAt = Date.now();
        logger.info({ name: entry.name }, 'job start');
        try {
          await entry.handler();
          logger.info({ name: entry.name, ms: Date.now() - startedAt }, 'job done');
        } catch (err) {
          logger.error({ name: entry.name, err }, 'job failed');
        }
      },
    );
    logger.info(
      { name: entry.name, pattern: entry.pattern, tz: APP_TZ, next: job.nextRun()?.toISOString() },
      'scheduled',
    );
    return job;
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'jobs runner shutting down');
    try {
      for (const job of jobs) job.stop();
      await closeRedis();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  logger.info({ count: jobs.length }, 'jobs runner ready');
}

main().catch((err) => {
  logger.fatal({ err }, 'jobs runner failed to start');
  process.exit(1);
});
