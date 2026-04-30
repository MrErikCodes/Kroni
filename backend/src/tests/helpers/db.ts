import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sql } from 'drizzle-orm';
import * as schema from '../../db/schema/index.js';
import * as relations from '../../db/relations.js';

// Test-DB lifecycle helpers. The whole suite shares one Postgres connection
// (separate from production's `db/index.ts` singleton, but pointing at the
// same TEST_DATABASE_URL so they see the same data). Migrations run once at
// suite start; `truncateAll()` wipes every table between tests so cases stay
// independent. The `_env.ts` bootstrap copies TEST_DATABASE_URL onto
// DATABASE_URL, so the production singleton is always pinned to the test DB
// during `npm test`.

type TestDb = ReturnType<typeof drizzle<typeof schema & typeof relations>>;

let pgClient: ReturnType<typeof postgres> | undefined;
let dbInstance: TestDb | undefined;
let migratedFor: string | undefined;

function resolveTestUrl(): string {
  // _env.ts already mirrored TEST_DATABASE_URL onto DATABASE_URL; both are
  // checked so this still works if a caller imports the helper directly.
  return (
    process.env.TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgres://kroni:kroni@localhost:5432/kroni_test'
  );
}

export async function setupTestDb(): Promise<TestDb> {
  const url = resolveTestUrl();
  if (dbInstance && migratedFor === url) return dbInstance;

  pgClient = postgres(url, { max: 4, prepare: false });
  dbInstance = drizzle(pgClient, {
    schema: { ...schema, ...relations },
    casing: 'snake_case',
  });

  const here = dirname(fileURLToPath(import.meta.url));
  // helpers/ → tests/ → src/ → backend/ → drizzle/
  const migrationsFolder = join(here, '..', '..', '..', 'drizzle');
  await migrate(dbInstance, { migrationsFolder });
  migratedFor = url;

  return dbInstance;
}

function assertTestDatabase(url: string): void {
  // Hard guard: refuse to TRUNCATE unless the database name unambiguously
  // identifies itself as a test DB. Anything else (kroni_dev, kroni, prod
  // names) aborts before we touch a single table. This is the second line
  // of defence behind `_env.ts` forcing DATABASE_URL onto TEST_DATABASE_URL.
  let dbName: string;
  try {
    const parsed = new URL(url);
    dbName = parsed.pathname.replace(/^\//, '');
  } catch {
    throw new Error(`truncateAll(): refusing to run, unparseable DATABASE_URL`);
  }
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `truncateAll(): refusing to truncate "${dbName}" — database name must end in "_test". ` +
        `Set TEST_DATABASE_URL to a dedicated test DB (default: kroni_test).`,
    );
  }
}

export async function truncateAll(db?: TestDb): Promise<void> {
  const target = db ?? dbInstance;
  if (!target) throw new Error('truncateAll() called before setupTestDb()');

  assertTestDatabase(resolveTestUrl());

  // Pull every public.* table and TRUNCATE in one statement with CASCADE so
  // FK ordering is irrelevant. drizzle's __drizzle_migrations metadata table
  // lives in its own schema (drizzle), so we never touch it here.
  const rows = await target.execute<{ table_name: string }>(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  `);
  const names = rows.map((r) => r.table_name).filter((n) => n !== '__drizzle_migrations');
  if (names.length === 0) return;

  const list = names.map((n) => `"public"."${n}"`).join(', ');
  await target.execute(sql.raw(`TRUNCATE ${list} RESTART IDENTITY CASCADE`));
}

export async function teardownTestDb(): Promise<void> {
  if (!pgClient) return;
  await pgClient.end({ timeout: 5 });
  pgClient = undefined;
  dbInstance = undefined;
  migratedFor = undefined;
}

export { sql };
