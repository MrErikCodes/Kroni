import test from 'node:test';
import assert from 'node:assert/strict';

// Env bootstrap lives in src/tests/_env.ts (loaded via tsx --import).
import {
  setupTestDb,
  snapshotDb,
  cleanupSinceSnapshot,
  teardownTestDb,
  type DbSnapshot,
} from './helpers/db.js';

const { getDb } = await import('../db/index.js');
const { parents } = await import('../db/schema/parents.js');
const { kids } = await import('../db/schema/kids.js');
const { households } = await import('../db/schema/households.js');
const { kidBalances } = await import('../db/schema/balance.js');
const { tasks } = await import('../db/schema/tasks.js');
const { logTaskCompletion } = await import('../services/tasks.service.js');
const { randomUUID } = await import('node:crypto');
const { closeRedis } = await import('../lib/redis.js');
const { closeDb } = await import('../db/index.js');

let snapshot: DbSnapshot;

test.before(async () => {
  await setupTestDb();
  snapshot = await snapshotDb();
});
test.afterEach(async () => {
  await cleanupSinceSnapshot(snapshot);
});
test.after(async () => {
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});

interface Seed {
  householdId: string;
  parentId: string;
  kidA: string;
  kidB: string;
  taskId: string;
}

async function seed(): Promise<Seed> {
  const db = getDb();
  const h = await db.insert(households).values({}).returning();
  const householdId = h[0]!.id;
  const p = await db
    .insert(parents)
    .values({ clerkUserId: `u_${randomUUID()}`, email: `${randomUUID()}@e.test`, householdId })
    .returning();
  const parentId = p[0]!.id;
  const a = await db
    .insert(kids)
    .values({ parentId, householdId, name: 'Ada' })
    .returning();
  const b = await db
    .insert(kids)
    .values({ parentId, householdId, name: 'Bob' })
    .returning();
  const kidA = a[0]!.id;
  const kidB = b[0]!.id;
  await db.insert(kidBalances).values({ kidId: kidA, balanceCents: 0 });
  await db.insert(kidBalances).values({ kidId: kidB, balanceCents: 0 });
  const t = await db
    .insert(tasks)
    .values({
      householdId,
      parentId,
      title: 'Pusse tenner',
      rewardCents: 500,
      recurrence: 'daily',
      requiresApproval: true,
      active: true,
    })
    .returning();
  return { householdId, parentId, kidA, kidB, taskId: t[0]!.id };
}

test('logTaskCompletion — credits both kids on first call', async () => {
  const { householdId, parentId, kidA, kidB, taskId } = await seed();
  const out = await logTaskCompletion({
    taskId,
    householdId,
    parentId,
    kidIds: [kidA, kidB],
    idempotencyKey: randomUUID(),
  });
  assert.equal(out.credited.length, 2);
  assert.equal(out.skipped.length, 0);
  assert.ok(out.credited.every((c) => c.newBalanceCents >= 500));
});

test('logTaskCompletion — returns alreadyCompleted on retry within the same day', async () => {
  const { householdId, parentId, kidA, kidB, taskId } = await seed();
  // First call credits both kids.
  await logTaskCompletion({
    taskId,
    householdId,
    parentId,
    kidIds: [kidA, kidB],
    idempotencyKey: randomUUID(),
  });
  // Second call (same day) should skip both as alreadyCompleted.
  const out = await logTaskCompletion({
    taskId,
    householdId,
    parentId,
    kidIds: [kidA, kidB],
    idempotencyKey: randomUUID(),
  });
  assert.equal(out.credited.length, 0);
  assert.equal(out.skipped.length, 2);
  assert.ok(out.skipped.every((s) => s.reason === 'alreadyCompleted'));
});

test('logTaskCompletion — rejects kids outside the household', async () => {
  const { householdId, parentId, taskId } = await seed();
  const db = getDb();
  const otherHousehold = await db.insert(households).values({}).returning();
  const otherHouseholdId = otherHousehold[0]!.id;
  const otherKid = await db
    .insert(kids)
    .values({ householdId: otherHouseholdId, name: 'Eve' })
    .returning();
  const otherKidId = otherKid[0]!.id;
  await db.insert(kidBalances).values({ kidId: otherKidId, balanceCents: 0 });

  await assert.rejects(
    () =>
      logTaskCompletion({
        taskId,
        householdId,
        parentId,
        kidIds: [otherKidId],
        idempotencyKey: randomUUID(),
      }),
    /not in this household/,
  );
});
