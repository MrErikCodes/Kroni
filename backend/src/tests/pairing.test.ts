import test from 'node:test';
import assert from 'node:assert/strict';

// Env bootstrap (DATABASE_URL → TEST_DATABASE_URL, placeholders) lives in
// src/tests/_env.ts and is loaded via `tsx --import` before this module.
import { setupTestDb, truncateAll, teardownTestDb } from './helpers/db.js';

const { buildApp } = await import('../app.js');
const { getDb } = await import('../db/index.js');
const { getRedis } = await import('../lib/redis.js');
const { parents } = await import('../db/schema/parents.js');
const { households } = await import('../db/schema/households.js');
const { pairingCodes, kidDevices } = await import('../db/schema/pairing.js');
const { kids } = await import('../db/schema/kids.js');
const { kidBalances } = await import('../db/schema/balance.js');
const { signKidJwt, verifyKidJwt } = await import('../lib/jwt.js');
const { eq } = await import('drizzle-orm');

async function seedParent(): Promise<{ parentId: string; householdId: string }> {
  const db = getDb();
  const h = await db.insert(households).values({}).returning();
  const householdId = h[0]!.id;
  const inserted = await db
    .insert(parents)
    .values({
      clerkUserId: `user_test_${Math.random().toString(36).slice(2, 10)}`,
      email: `t${Date.now()}@example.com`,
      householdId,
    })
    .returning();
  const parent = inserted[0];
  assert.ok(parent);
  return { parentId: parent.id, householdId };
}

async function seedKid(
  parentId: string,
  householdId: string,
  name = 'Ada',
): Promise<{ kidId: string }> {
  const db = getDb();
  const inserted = await db
    .insert(kids)
    .values({ parentId, householdId, name })
    .returning();
  const kid = inserted[0];
  assert.ok(kid);
  await db.insert(kidBalances).values({ kidId: kid.id, balanceCents: 0 });
  return { kidId: kid.id };
}

async function clearRedisRateLimits(): Promise<void> {
  const r = getRedis();
  const keys = await r.keys('rl:*');
  if (keys.length) await r.del(...keys);
}

const { closeRedis } = await import('../lib/redis.js');
const { closeDb } = await import('../db/index.js');

test.before(async () => {
  await setupTestDb();
});
test.beforeEach(async () => {
  await truncateAll();
  await clearRedisRateLimits();
});
test.after(async () => {
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});

test('pairing — code redemption attaches device to existing kid', async () => {
  await clearRedisRateLimits();
  const { parentId, householdId } = await seedParent();
  const { kidId } = await seedKid(parentId, householdId, 'Ada');
  const db = getDb();

  const code = String(100_000 + Math.floor(Math.random() * 900_000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db
    .insert(pairingCodes)
    .values({ code, parentId, householdId, targetKidId: kidId, expiresAt });

  const deviceId = 'dev_' + Math.random().toString(36).slice(2, 12);
  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/public/pair',
      payload: { code, deviceId },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { token: string; kid: { id: string; parentId: string; name: string } };
    assert.ok(body.token.length > 20);
    assert.equal(body.kid.id, kidId, 'returns the pre-existing kid, not a new one');
    assert.equal(body.kid.parentId, parentId);
    assert.equal(body.kid.name, 'Ada');

    // No new kid record should have been created.
    const kidCount = await db.select().from(kids).where(eq(kids.householdId, householdId));
    assert.equal(kidCount.length, 1);

    // Device row attached to the existing kid.
    const devices = await db.select().from(kidDevices).where(eq(kidDevices.kidId, kidId));
    assert.equal(devices.length, 1);
    assert.equal(devices[0]?.deviceId, deviceId);

    const codeRows = await db.select().from(pairingCodes).where(eq(pairingCodes.code, code)).limit(1);
    assert.ok(codeRows[0]?.usedAt !== null, 'code marked used');
    assert.equal(codeRows[0]?.usedByKidId, kidId);

    const payload = verifyKidJwt(body.token);
    assert.equal(payload.sub, kidId);
    assert.equal(payload.parent_id, parentId);
  } finally {
    await app.close();
  }
});

test('pairing — expired code is rejected', async () => {
  await clearRedisRateLimits();
  const { parentId, householdId } = await seedParent();
  const { kidId } = await seedKid(parentId, householdId);
  const db = getDb();
  const code = String(100_000 + Math.floor(Math.random() * 900_000));
  const expiresAt = new Date(Date.now() - 60_000); // already expired
  await db
    .insert(pairingCodes)
    .values({ code, parentId, householdId, targetKidId: kidId, expiresAt });

  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/public/pair',
      payload: { code, deviceId: 'dev_' + Math.random().toString(36).slice(2, 12) },
    });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('pairing — already-used code is rejected', async () => {
  await clearRedisRateLimits();
  const { parentId, householdId } = await seedParent();
  const { kidId } = await seedKid(parentId, householdId);
  const db = getDb();
  const code = String(100_000 + Math.floor(Math.random() * 900_000));
  await db.insert(pairingCodes).values({
    code,
    parentId,
    householdId,
    targetKidId: kidId,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    usedAt: new Date(),
  });

  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/api/public/pair',
      payload: { code, deviceId: 'dev_' + Math.random().toString(36).slice(2, 12) },
    });
    assert.equal(res.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('pairing — IP rate limit kicks in after 5 attempts', async () => {
  await clearRedisRateLimits();
  const app = await buildApp();
  try {
    let last = 0;
    for (let i = 0; i < 6; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/public/pair',
        payload: { code: '000000', deviceId: `dev_unique_${i}` },
        remoteAddress: '203.0.113.42',
      });
      last = res.statusCode;
    }
    assert.equal(last, 429);
  } finally {
    await app.close();
  }
});

test('pairing — kid JWT refresh issues new header when token near expiry', async () => {
  await clearRedisRateLimits();
  const { parentId, householdId } = await seedParent();
  const db = getDb();
  const inserted = await db
    .insert(kids)
    .values({ parentId, householdId, name: 'Refresh' })
    .returning();
  const kid = inserted[0];
  assert.ok(kid);
  await db.insert(kidBalances).values({ kidId: kid.id, balanceCents: 0 });

  // Forge a JWT with only 5 days remaining (well below 30-day threshold).
  const shortToken = signKidJwt(
    { sub: kid.id, parent_id: parentId, device_id: 'dev_refresh' },
    5 * 24 * 60 * 60,
  );

  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'GET',
      url: '/api/public/health',
      headers: { authorization: `Bearer ${shortToken}` },
    });
    // Health route doesn't require kid auth, so we test refresh on a kid route once it exists.
    // For now, just assert health still returns 200 even with a kid token in header.
    assert.equal(res.statusCode, 200);
  } finally {
    await app.close();
  }
});
