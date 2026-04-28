import { initSentry } from './lib/sentry.js';
// Initialize Sentry first so anything that throws at boot is captured.
initSentry();

import { buildApp } from './app.js';
import { getConfig } from './config.js';
import { logger } from './lib/logger.js';
import { closeDb } from './db/index.js';
import { closeRedis } from './lib/redis.js';

async function main(): Promise<void> {
  const cfg = getConfig();
  const app = await buildApp();
  await app.listen({ port: cfg.PORT, host: '0.0.0.0' });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down');
    try {
      await app.close();
      await closeDb();
      await closeRedis();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'server failed to start');
  process.exit(1);
});
