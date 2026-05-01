import test from 'node:test';
import assert from 'node:assert/strict';

// Env bootstrap (DATABASE_URL → TEST_DATABASE_URL, placeholders) lives in
// src/tests/_env.ts and is loaded via `tsx --import` before this module.
import {
  setupTestDb,
  snapshotDb,
  cleanupSinceSnapshot,
  teardownTestDb,
  type DbSnapshot,
} from '../helpers/db.js';

// Pin a known bearer for every test in this file. Webhook authorized()
// reads the value at request time via getConfig() — we cleared the cached
// config in _env.ts (NODE_ENV=test) and the real value comes from
// process.env. Setting it before app.build() ensures it lands in the cache.
process.env.REVENUECAT_WEBHOOK_AUTH = 'rc_test_secret';

const { buildApp } = await import('../../app.js');
const { getDb } = await import('../../db/index.js');
const { closeRedis, getRedis } = await import('../../lib/redis.js');
const { closeDb } = await import('../../db/index.js');
const { parents } = await import('../../db/schema/parents.js');
const { households } = await import('../../db/schema/households.js');
const { processedWebhookEvents } = await import('../../db/schema/webhook-events.js');
const { resetConfigForTests } = await import('../../config.js');
const { eq } = await import('drizzle-orm');
const { randomUUID } = await import('node:crypto');

let snapshot: DbSnapshot;

async function clearRedisRateLimits(): Promise<void> {
  const r = getRedis();
  const keys = await r.keys('rl:*');
  if (keys.length) await r.del(...keys);
}

test.before(async () => {
  await setupTestDb();
  snapshot = await snapshotDb();
});
test.beforeEach(async () => {
  await clearRedisRateLimits();
});
test.afterEach(async () => {
  await cleanupSinceSnapshot(snapshot);
});
test.after(async () => {
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});

async function seedParent(): Promise<{ parentId: string; householdId: string; clerkUserId: string }> {
  const db = getDb();
  const h = await db.insert(households).values({}).returning();
  const householdId = h[0]!.id;
  const clerkUserId = `user_test_${randomUUID()}`;
  const inserted = await db
    .insert(parents)
    .values({
      clerkUserId,
      email: `t-${randomUUID()}@example.com`,
      householdId,
    })
    .returning();
  return { parentId: inserted[0]!.id, householdId, clerkUserId };
}

function rcEvent(opts: {
  type: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number | null;
  period_type?: string;
  id?: string;
}): Record<string, unknown> {
  return {
    api_version: '1.0',
    event: {
      type: opts.type,
      id: opts.id ?? `evt_${randomUUID()}`,
      app_user_id: opts.app_user_id,
      product_id: opts.product_id,
      period_type: opts.period_type,
      expiration_at_ms: opts.expiration_at_ms,
      environment: 'PRODUCTION',
    },
  };
}

const AUTH: Record<string, string> = { authorization: 'Bearer rc_test_secret' };

test('rc — INITIAL_PURCHASE of kroni_lifetime sets lifetime_paid=true', async () => {
  const { householdId, clerkUserId } = await seedParent();
  const app = await buildApp();
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'INITIAL_PURCHASE',
        app_user_id: clerkUserId,
        product_id: 'kroni_lifetime',
      }),
    });
    assert.equal(res.statusCode, 200);
    const db = getDb();
    const [row] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
    assert.equal(row?.lifetimePaid, true);
    assert.equal(row?.subscriptionTier, 'family');
  } finally {
    await app.close();
  }
});

test('rc — replayed event with same event.id returns deduped 200 and does not double-write', async () => {
  const { householdId, clerkUserId } = await seedParent();
  const app = await buildApp();
  try {
    const eventId = `evt_${randomUUID()}`;
    // First delivery — establish a subscription with an explicit expiry.
    const future = Date.now() + 30 * 86_400_000;
    const first = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'INITIAL_PURCHASE',
        app_user_id: clerkUserId,
        product_id: 'kroni_monthly',
        expiration_at_ms: future,
        period_type: 'NORMAL',
        id: eventId,
      }),
    });
    assert.equal(first.statusCode, 200);
    assert.deepEqual(first.json(), { ok: true });

    const db = getDb();
    const [before] = await db
      .select()
      .from(households)
      .where(eq(households.id, householdId))
      .limit(1);
    assert.equal(before?.subscriptionTier, 'family');
    const beforeUpdatedAt = before!.updatedAt!.getTime();

    // Replay the *same* event id — should dedup and NOT touch the row.
    const second = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'INITIAL_PURCHASE',
        app_user_id: clerkUserId,
        product_id: 'kroni_monthly',
        expiration_at_ms: future,
        period_type: 'NORMAL',
        id: eventId,
      }),
    });
    assert.equal(second.statusCode, 200);
    assert.deepEqual(second.json(), { deduped: true });

    const [after] = await db
      .select()
      .from(households)
      .where(eq(households.id, householdId))
      .limit(1);
    // updatedAt must be unchanged because the dedup short-circuit fired
    // before the household UPDATE.
    assert.equal(after?.updatedAt?.getTime(), beforeUpdatedAt);
  } finally {
    await app.close();
  }
});

test('rc — stale EXPIRATION after a RENEWAL does NOT downgrade', async () => {
  const { householdId, clerkUserId } = await seedParent();
  const app = await buildApp();
  try {
    // RENEWAL pushes expiry far into the future.
    const farFuture = Date.now() + 60 * 86_400_000;
    const renewal = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'RENEWAL',
        app_user_id: clerkUserId,
        product_id: 'kroni_monthly',
        expiration_at_ms: farFuture,
        period_type: 'NORMAL',
      }),
    });
    assert.equal(renewal.statusCode, 200);

    // Stale EXPIRATION carrying an older expiry (previous billing
    // period) — must be ignored.
    const staleExpiry = Date.now() - 1 * 86_400_000;
    const exp = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'EXPIRATION',
        app_user_id: clerkUserId,
        product_id: 'kroni_monthly',
        expiration_at_ms: staleExpiry,
      }),
    });
    assert.equal(exp.statusCode, 200);

    const db = getDb();
    const [row] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
    assert.equal(row?.subscriptionTier, 'family', 'stale expiration must not downgrade');
    assert.ok(row?.subscriptionExpiresAt && row.subscriptionExpiresAt.getTime() > Date.now());
  } finally {
    await app.close();
  }
});

test('rc — EXPIRATION on a lifetime owner does NOT revoke', async () => {
  const { householdId, clerkUserId } = await seedParent();
  const app = await buildApp();
  try {
    const grant = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'INITIAL_PURCHASE',
        app_user_id: clerkUserId,
        product_id: 'kroni_lifetime',
      }),
    });
    assert.equal(grant.statusCode, 200);

    const exp = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'EXPIRATION',
        app_user_id: clerkUserId,
        product_id: 'kroni_monthly',
        expiration_at_ms: Date.now(),
      }),
    });
    assert.equal(exp.statusCode, 200);

    const db = getDb();
    const [row] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
    assert.equal(row?.lifetimePaid, true);
    assert.equal(row?.subscriptionTier, 'family');
  } finally {
    await app.close();
  }
});

test('rc — unknown app_user_id returns 200 ack with no DB write', async () => {
  const app = await buildApp();
  try {
    const db = getDb();
    const beforeCount = (await db.select().from(processedWebhookEvents)).length;
    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: AUTH,
      payload: rcEvent({
        type: 'INITIAL_PURCHASE',
        app_user_id: 'user_does_not_exist_in_db',
        product_id: 'kroni_monthly',
        expiration_at_ms: Date.now() + 30 * 86_400_000,
      }),
    });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { ok: true });
    // The event_id WAS recorded (dedup is the first thing we do), but no
    // household / parent state changed because resolution failed. That's
    // the contract — RC won't retry on a 200 + the dedup row keeps a
    // future replay from re-running the lookup.
    const afterCount = (await db.select().from(processedWebhookEvents)).length;
    assert.equal(afterCount, beforeCount + 1);
  } finally {
    await app.close();
  }
});

test('rc — missing/wrong bearer returns 401', async () => {
  const app = await buildApp();
  try {
    const noAuth = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      payload: rcEvent({ type: 'TEST' }),
    });
    assert.equal(noAuth.statusCode, 401);

    const wrongAuth = await app.inject({
      method: 'POST',
      url: '/webhooks/revenuecat',
      headers: { authorization: 'Bearer not_the_secret' },
      payload: rcEvent({ type: 'TEST' }),
    });
    assert.equal(wrongAuth.statusCode, 401);
  } finally {
    await app.close();
  }
});

test('rc — production NODE_ENV without REVENUECAT_WEBHOOK_AUTH refuses to boot', async () => {
  // Save + clear the var, flip NODE_ENV to production, reset the cached
  // config so the next getConfig() sees the new env, then ensure
  // buildApp() (which calls getConfig()) throws. Restore everything in a
  // finally so subsequent tests see the test config.
  const savedAuth = process.env.REVENUECAT_WEBHOOK_AUTH;
  const savedNodeEnv = process.env.NODE_ENV;
  delete process.env.REVENUECAT_WEBHOOK_AUTH;
  process.env.NODE_ENV = 'production';
  resetConfigForTests();
  try {
    await assert.rejects(
      async () => {
        const a = await buildApp();
        await a.close();
      },
      /REVENUECAT_WEBHOOK_AUTH/,
    );
  } finally {
    if (savedAuth !== undefined) process.env.REVENUECAT_WEBHOOK_AUTH = savedAuth;
    if (savedNodeEnv !== undefined) process.env.NODE_ENV = savedNodeEnv;
    else process.env.NODE_ENV = 'test';
    resetConfigForTests();
  }
});
