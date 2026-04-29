import test from 'node:test';
import assert from 'node:assert/strict';

// Env (DATABASE_URL → TEST_DATABASE_URL, Clerk/JWT placeholders) is set up
// in src/tests/_env.ts via tsx --import. Health doesn't hit DB but we still
// wire setup/teardown so this file can run alongside DB-bound suites.
import { setupTestDb, teardownTestDb } from './helpers/db.js';

const { buildApp } = await import('../app.js');
const { closeRedis } = await import('../lib/redis.js');
const { closeDb } = await import('../db/index.js');

test.before(async () => {
  await setupTestDb();
});

test('GET /public/health returns 200 ok', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/public/health' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { status: string; uptime: number; version: string };
    assert.equal(body.status, 'ok');
    assert.equal(typeof body.uptime, 'number');
    assert.equal(typeof body.version, 'string');
  } finally {
    await app.close();
  }
});

test.after(async () => {
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});
