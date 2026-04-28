import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getConfig } from '../config.js';
import { logger } from '../lib/logger.js';

async function main(): Promise<void> {
  const cfg = getConfig();
  // drizzle-kit emits SQL into ./drizzle relative to backend root.
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = join(here, '..', '..', 'drizzle');
  const client = postgres(cfg.DATABASE_URL, { max: 1, prepare: false });
  const db = drizzle(client);
  try {
    await migrate(db, { migrationsFolder });
    logger.info({ migrationsFolder }, 'migrations applied');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  logger.error({ err }, 'migration failed');
  process.exit(1);
});
