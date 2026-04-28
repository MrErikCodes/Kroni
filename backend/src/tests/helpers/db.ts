import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sql } from 'drizzle-orm';
import * as schema from '../../db/schema/index.js';
import * as relations from '../../db/relations.js';

// Spawn a fresh per-test schema so suites can run in parallel without cross-talk.
// Uses the connection from process.env.DATABASE_URL — must be a writable Postgres
// the test process owns. CI provisions this via docker-compose.test.yml.

export interface TestDbHandle {
  db: ReturnType<typeof drizzle<typeof schema & typeof relations>>;
  schemaName: string;
  cleanup: () => Promise<void>;
}

export async function createTestDb(): Promise<TestDbHandle> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL must be set for tests');

  const schemaName = `t_${Math.random().toString(36).slice(2, 10)}`;
  const client = postgres(url, { max: 2, prepare: false });
  await client`CREATE SCHEMA IF NOT EXISTS ${client(schemaName)}`;
  await client`SET search_path TO ${client(schemaName)}`;

  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = join(here, '..', '..', '..', 'drizzle');

  const db = drizzle(client, { schema: { ...schema, ...relations }, casing: 'snake_case' });
  await migrate(db, { migrationsFolder });

  return {
    db,
    schemaName,
    cleanup: async () => {
      await client`DROP SCHEMA IF EXISTS ${client(schemaName)} CASCADE`;
      await client.end();
    },
  };
}

export { sql };
