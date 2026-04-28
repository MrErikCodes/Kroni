import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getConfig } from '../config.js';
import * as schema from './schema/index.js';
import * as relations from './relations.js';

let pgClient: ReturnType<typeof postgres> | undefined;
let dbInstance: ReturnType<typeof buildDb> | undefined;

function buildDb(client: ReturnType<typeof postgres>) {
  return drizzle(client, {
    schema: { ...schema, ...relations },
    casing: 'snake_case',
  });
}

export type Db = ReturnType<typeof buildDb>;

export function getDb(): Db {
  if (dbInstance) return dbInstance;
  const cfg = getConfig();
  pgClient = postgres(cfg.DATABASE_URL, {
    max: cfg.NODE_ENV === 'production' ? 20 : 5,
    idle_timeout: 30,
    prepare: false,
  });
  dbInstance = buildDb(pgClient);
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (!pgClient) return;
  await pgClient.end({ timeout: 5 });
  pgClient = undefined;
  dbInstance = undefined;
}
