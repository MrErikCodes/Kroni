import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sql } from 'drizzle-orm';
import * as schema from '../../db/schema/index.js';
import * as relations from '../../db/relations.js';

// Test-DB lifecycle helpers. The suite runs against whatever DATABASE_URL
// phase injects (the dev DB, by design). To avoid wiping pre-existing dev
// data we use a snapshot+cleanup model:
//
//   1. setupTestDb()  → connects + runs (idempotent) migrations.
//   2. snapshotDb()   → records every public.* table's current primary-key
//                       values. Call this once at suite start.
//   3. cleanupSinceSnapshot(snap)
//                     → for each table, DELETEs only rows whose PK is NOT
//                       in the snapshot (i.e. rows the tests inserted).
//                       FK ordering is handled by retrying tables that hit
//                       FK violations until the work drains.
//
// Limitations the test author must know:
//   • This only undoes INSERTs. UPDATEs or DELETEs of pre-existing dev rows
//     are NOT reversed — design tests to insert their own fixtures.
//   • Tables without a primary key cannot be tracked; setupTestDb() will
//     refuse to snapshot them.
//   • A per-table safety cap (MAX_DELETES_PER_TABLE) aborts cleanup if it
//     would delete an implausible number of rows, so a runaway test can't
//     silently nuke dev.
//
// Production DBs are blocked by `assertNotProdDatabase()` (DB name must
// not contain "prod"). Even if phase env is misconfigured, the suite will
// refuse to attach.

type TestDb = ReturnType<typeof drizzle<typeof schema & typeof relations>>;
type RawClient = ReturnType<typeof postgres>;

interface TableSnapshot {
  pkCols: string[];
  // JSON.stringify of pkCols.map(c => row[c]) for each row.
  pks: Set<string>;
}
export type DbSnapshot = Map<string, TableSnapshot>;

const MAX_DELETES_PER_TABLE = 10_000;
const MAX_CLEANUP_PASSES = 10;
// Plain snake_case identifier — matches every drizzle-generated name in
// this schema. Anything else is rejected so `quoteIdent` can't be tricked
// into producing a SQL injection vector for the dynamic DELETE/SELECT.
const SAFE_IDENT = /^[a-z_][a-z0-9_]*$/;

let pgClient: RawClient | undefined;
let dbInstance: TestDb | undefined;
let migratedFor: string | undefined;

function resolveTestUrl(): string {
  return (
    process.env.DATABASE_URL ??
    'postgres://kroni:kroni@localhost:5432/kroni_test'
  );
}

function assertNotProdDatabase(url: string): void {
  let dbName: string;
  try {
    const parsed = new URL(url);
    dbName = parsed.pathname.replace(/^\//, '').toLowerCase();
  } catch {
    throw new Error('test DB guard: refusing to run against unparseable DATABASE_URL');
  }
  if (!dbName) {
    throw new Error('test DB guard: DATABASE_URL has no database name');
  }
  if (/prod/.test(dbName)) {
    throw new Error(
      `test DB guard: refusing to run against suspected production database "${dbName}" — DB name contains "prod"`,
    );
  }
}

function quoteIdent(name: string): string {
  if (!SAFE_IDENT.test(name)) {
    throw new Error(`unsafe SQL identifier: ${JSON.stringify(name)}`);
  }
  return `"${name}"`;
}

function pkKey(pkCols: string[], row: Record<string, unknown>): string {
  return JSON.stringify(pkCols.map((c) => row[c]));
}

function isFkViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === '23503'
  );
}

export async function setupTestDb(): Promise<TestDb> {
  const url = resolveTestUrl();
  assertNotProdDatabase(url);
  if (dbInstance && migratedFor === url) return dbInstance;

  pgClient = postgres(url, { max: 4, prepare: false });
  dbInstance = drizzle(pgClient, {
    schema: { ...schema, ...relations },
    casing: 'snake_case',
  });

  const here = dirname(fileURLToPath(import.meta.url));
  // helpers/ → tests/ → src/ → backend/ → drizzle/
  const migrationsFolder = join(here, '..', '..', '..', 'drizzle');
  // Idempotent on already-migrated DBs (drizzle skips applied migrations
  // via the __drizzle_migrations metadata table in its own schema).
  await migrate(dbInstance, { migrationsFolder });
  migratedFor = url;

  return dbInstance;
}

export async function snapshotDb(): Promise<DbSnapshot> {
  if (!pgClient) throw new Error('snapshotDb() called before setupTestDb()');
  const client = pgClient;

  const tables = await client<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name <> '__drizzle_migrations'
    ORDER BY table_name
  `;

  const snapshot: DbSnapshot = new Map();
  for (const { table_name } of tables) {
    const pkRows = await client<{ column_name: string }[]>`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = ${table_name}
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position
    `;
    if (pkRows.length === 0) {
      throw new Error(
        `snapshotDb(): table "${table_name}" has no primary key — snapshot cleanup cannot track its rows safely`,
      );
    }
    const pkCols = pkRows.map((r) => r.column_name);
    const colList = pkCols.map(quoteIdent).join(', ');
    const tableQ = `${quoteIdent('public')}.${quoteIdent(table_name)}`;
    const rows = (await client.unsafe(
      `SELECT ${colList} FROM ${tableQ}`,
    )) as Record<string, unknown>[];

    const pks = new Set<string>();
    for (const row of rows) pks.add(pkKey(pkCols, row));
    snapshot.set(table_name, { pkCols, pks });
  }
  return snapshot;
}

async function deleteSinceSnapshotForTable(
  client: RawClient,
  table: string,
  snap: TableSnapshot,
): Promise<void> {
  const cols = snap.pkCols;
  const colList = cols.map(quoteIdent).join(', ');
  const tableQ = `${quoteIdent('public')}.${quoteIdent(table)}`;

  const current = (await client.unsafe(
    `SELECT ${colList} FROM ${tableQ}`,
  )) as Record<string, unknown>[];

  const toDelete: unknown[][] = [];
  for (const row of current) {
    if (!snap.pks.has(pkKey(cols, row))) {
      toDelete.push(cols.map((c) => row[c]));
    }
  }
  if (toDelete.length === 0) return;
  if (toDelete.length > MAX_DELETES_PER_TABLE) {
    throw new Error(
      `cleanupSinceSnapshot: refusing to delete ${toDelete.length} rows from "${table}" — exceeds safety cap of ${MAX_DELETES_PER_TABLE}. Either a test is leaking data or the snapshot is stale.`,
    );
  }

  if (cols.length === 1) {
    const ids = toDelete.map((t) => t[0]);
    await client.unsafe(
      `DELETE FROM ${tableQ} WHERE ${quoteIdent(cols[0]!)} = ANY($1)`,
      [ids as unknown as never],
    );
  } else {
    const placeholders = toDelete
      .map(
        (_, rowIdx) =>
          `(${cols.map((_, colIdx) => `$${rowIdx * cols.length + colIdx + 1}`).join(', ')})`,
      )
      .join(', ');
    const params = toDelete.flat();
    await client.unsafe(
      `DELETE FROM ${tableQ} WHERE (${colList}) IN (${placeholders})`,
      params as unknown as never[],
    );
  }
}

export async function cleanupSinceSnapshot(snapshot: DbSnapshot): Promise<void> {
  if (!pgClient) throw new Error('cleanupSinceSnapshot() called before setupTestDb()');
  assertNotProdDatabase(resolveTestUrl());
  const client = pgClient;

  // FK ordering: try every table, retry the ones that hit FK violations
  // (children of other tables we haven't drained yet). Loop until either
  // every table is clean or we make zero progress in a pass.
  let pending = new Map(snapshot);
  for (let pass = 0; pass < MAX_CLEANUP_PASSES && pending.size > 0; pass++) {
    const next = new Map<string, TableSnapshot>();
    let progressed = false;
    for (const [table, snap] of pending) {
      try {
        await deleteSinceSnapshotForTable(client, table, snap);
        progressed = true;
      } catch (err) {
        if (isFkViolation(err)) {
          next.set(table, snap);
          continue;
        }
        throw err;
      }
    }
    if (!progressed && next.size === pending.size) break;
    pending = next;
  }
  if (pending.size > 0) {
    throw new Error(
      `cleanupSinceSnapshot: could not drain ${[...pending.keys()].join(', ')} (likely an FK cycle or constraint we don't know how to defer)`,
    );
  }
}

export async function teardownTestDb(): Promise<void> {
  if (!pgClient) return;
  await pgClient.end({ timeout: 5 });
  pgClient = undefined;
  dbInstance = undefined;
  migratedFor = undefined;
}

export { sql };
