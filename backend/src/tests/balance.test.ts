import test from 'node:test';
import assert from 'node:assert/strict';

// Env bootstrap lives in src/tests/_env.ts (loaded via tsx --import).
import { setupTestDb, truncateAll, teardownTestDb } from './helpers/db.js';

const { getDb } = await import('../db/index.js');
const { parents } = await import('../db/schema/parents.js');
const { kids } = await import('../db/schema/kids.js');
const { households } = await import('../db/schema/households.js');
const { kidBalances } = await import('../db/schema/balance.js');
const { tasks, taskCompletions } = await import('../db/schema/tasks.js');
const { addBalanceEntry, recomputeBalance } = await import('../services/balance.service.js');
const { eq } = await import('drizzle-orm');
const { todayInAppTz } = await import('../lib/time.js');
const { randomUUID } = await import('node:crypto');
const { closeRedis } = await import('../lib/redis.js');
const { closeDb } = await import('../db/index.js');

test.before(async () => {
  await setupTestDb();
});
test.beforeEach(async () => {
  await truncateAll();
});
test.after(async () => {
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});

async function seed(): Promise<{ parentId: string; kidId: string; householdId: string }> {
  const db = getDb();
  const h = await db.insert(households).values({}).returning();
  const householdId = h[0]!.id;
  const p = await db
    .insert(parents)
    .values({ clerkUserId: `u_${randomUUID()}`, email: `${randomUUID()}@e.test`, householdId })
    .returning();
  const k = await db
    .insert(kids)
    .values({ parentId: p[0]!.id, householdId, name: 'Tim' })
    .returning();
  await db.insert(kidBalances).values({ kidId: k[0]!.id, balanceCents: 0 });
  return { parentId: p[0]!.id, kidId: k[0]!.id, householdId };
}

test('balance — credit increases balance and append-only ledger', async () => {
  const { kidId } = await seed();
  const r = await addBalanceEntry({ kidId, amountCents: 5000, reason: 'task' });
  assert.equal(r.newBalanceCents, 5000);
  const rec = await recomputeBalance(kidId);
  assert.equal(rec, 5000);
});

test('balance — preventNegative blocks debit beyond balance', async () => {
  const { kidId } = await seed();
  await addBalanceEntry({ kidId, amountCents: 1000, reason: 'task' });
  await assert.rejects(
    () =>
      addBalanceEntry({
        kidId,
        amountCents: -2000,
        reason: 'redemption',
        preventNegative: true,
      }),
    /insufficient balance/,
  );
});

test('balance — recompute matches materialized after 50 random ops', async () => {
  const { kidId } = await seed();
  let expected = 0;
  for (let i = 0; i < 50; i++) {
    const amount = Math.floor(Math.random() * 1000) - 200; // -200..799
    if (amount === 0) continue;
    expected += amount;
    if (expected < 0) {
      // Skip would-be-negative; preventNegative would throw and break the loop.
      expected -= amount;
      continue;
    }
    await addBalanceEntry({ kidId, amountCents: amount, reason: 'adjustment' });
  }
  const recomputed = await recomputeBalance(kidId);
  const db = getDb();
  const balRow = (await db.select().from(kidBalances).where(eq(kidBalances.kidId, kidId)))[0];
  assert.equal(recomputed, expected);
  assert.equal(balRow?.balanceCents, expected);
});

test('task completion — requiresApproval=false credits immediately', async () => {
  const { parentId, kidId, householdId } = await seed();
  const db = getDb();
  const t = await db
    .insert(tasks)
    .values({
      parentId,
      householdId,
      kidId,
      title: 'Brush teeth',
      rewardCents: 200,
      recurrence: 'daily',
      requiresApproval: false,
    })
    .returning();
  const c = await db
    .insert(taskCompletions)
    .values({
      taskId: t[0]!.id,
      kidId,
      scheduledFor: todayInAppTz(),
      rewardCents: 200,
    })
    .returning();

  // Simulate the kid POST /kid/tasks/:id/complete flow inline.
  await db.transaction(async (tx) => {
    const { addBalanceEntryInTx } = await import('../services/balance.service.js');
    await tx
      .update(taskCompletions)
      .set({ completedAt: new Date(), approvedAt: new Date() })
      .where(eq(taskCompletions.id, c[0]!.id));
    await addBalanceEntryInTx(tx, {
      kidId,
      amountCents: 200,
      reason: 'task',
      referenceId: c[0]!.id,
    });
  });

  const recomputed = await recomputeBalance(kidId);
  assert.equal(recomputed, 200);
});
