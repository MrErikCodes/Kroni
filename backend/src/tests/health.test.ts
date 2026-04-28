import test from 'node:test';
import assert from 'node:assert/strict';

// Health route doesn't depend on DB or Redis, so this test only needs valid env.
// Provide minimal config before importing the app.
// Load .env first so backend/.env values populate process.env before any module reads config.
await import('dotenv/config');
process.env.NODE_ENV = 'test';
// Provide non-secret placeholders only for vars not already set by .env.
process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);

const { buildApp } = await import('../app.js');
const { closeRedis } = await import('../lib/redis.js');
const { closeDb } = await import('../db/index.js');

test('GET /api/public/health returns 200 ok', async () => {
  const app = await buildApp();
  try {
    const res = await app.inject({ method: 'GET', url: '/api/public/health' });
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
});
