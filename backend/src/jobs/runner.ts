import { Queue, Worker, type Job } from 'bullmq';
import { getRedis } from '../lib/redis.js';
import { getConfig } from '../config.js';
import { logger } from '../lib/logger.js';
import { runDailyReset } from './daily-reset.js';
import { runAllowance } from './allowance.js';
import { runApprovalReminders } from './approval-reminders.js';
import { runCleanup } from './cleanup.js';

const QUEUE_NAME = 'kroni-cron';

interface JobMap {
  'daily-reset': void;
  allowance: void;
  'approval-reminders': void;
  cleanup: void;
}

type JobName = keyof JobMap;

const handlers: Record<JobName, () => Promise<void>> = {
  'daily-reset': runDailyReset,
  allowance: runAllowance,
  'approval-reminders': runApprovalReminders,
  cleanup: runCleanup,
};

const schedule: Array<{ name: JobName; cron: string }> = [
  { name: 'daily-reset', cron: '5 0 * * *' },
  // Daily 08:00 Oslo. Per-kid schedule (weekly / biweekly / monthly) is
  // resolved inside the handler. See jobs/allowance.ts.
  { name: 'allowance', cron: '0 8 * * *' },
  { name: 'approval-reminders', cron: '*/30 * * * *' },
  { name: 'cleanup', cron: '0 * * * *' },
];

async function main(): Promise<void> {
  const cfg = getConfig();
  const connection = getRedis();

  const queue = new Queue(QUEUE_NAME, { connection });

  // Remove any old repeat schedules so we end up with the canonical set.
  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    await queue.removeRepeatableByKey(job.key);
  }

  for (const entry of schedule) {
    await queue.add(entry.name, {}, {
      repeat: { pattern: entry.cron, tz: cfg.APP_TIMEZONE },
      removeOnComplete: 50,
      removeOnFail: 100,
    });
    logger.info({ name: entry.name, cron: entry.cron, tz: cfg.APP_TIMEZONE }, 'scheduled');
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const handler = handlers[job.name as JobName];
      if (!handler) {
        logger.warn({ name: job.name }, 'no handler for job');
        return;
      }
      logger.info({ name: job.name, id: job.id }, 'job start');
      await handler();
      logger.info({ name: job.name, id: job.id }, 'job done');
    },
    { connection, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobName: job?.name, err }, 'job failed');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'jobs runner shutting down');
    try {
      await worker.close();
      await queue.close();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  logger.info({ queue: QUEUE_NAME }, 'jobs runner ready');
}

main().catch((err) => {
  logger.fatal({ err }, 'jobs runner failed to start');
  process.exit(1);
});
