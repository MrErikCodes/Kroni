import test from 'node:test';
import assert from 'node:assert/strict';

// Health route doesn't depend on DB or Redis, so this test only needs valid env.
// Provide minimal config before importing the app.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://kroni:kroni@localhost:5432/kroni_test';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);

const { buildApp } = await import('../app.js');

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
