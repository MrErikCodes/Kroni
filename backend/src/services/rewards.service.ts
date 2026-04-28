import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { rewards } from '../db/schema/rewards.js';
import { rewardRedemptions } from '../db/schema/rewards.js';
import { kidBalances } from '../db/schema/balance.js';
import { addBalanceEntryInTx } from './balance.service.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';

// Block obviously-unaffordable redemptions at request time. The authoritative check
// happens again at parent approval (a kid can rack up multiple requests while parent
// is offline; the second approval may still fail with 409).
export async function requestRedemption(input: {
  kidId: string;
  rewardId: string;
}): Promise<{ redemptionId: string; rewardId: string; costCents: number }> {
  const db = getDb();
  const reward = (await db.select().from(rewards).where(eq(rewards.id, input.rewardId)).limit(1))[0];
  if (!reward || !reward.active) throw new NotFoundError('reward not available');
  if (reward.kidId !== null && reward.kidId !== input.kidId) {
    throw new NotFoundError('reward not available');
  }

  const balanceRow = (
    await db.select().from(kidBalances).where(eq(kidBalances.kidId, input.kidId)).limit(1)
  )[0];
  const balance = balanceRow?.balanceCents ?? 0;
  if (balance < reward.costCents) {
    throw new ConflictError(`insufficient balance: need ${reward.costCents} have ${balance}`);
  }

  const inserted = await db
    .insert(rewardRedemptions)
    .values({
      rewardId: reward.id,
      kidId: input.kidId,
      costCents: reward.costCents,
    })
    .returning({ id: rewardRedemptions.id });
  const redemption = inserted[0];
  if (!redemption) throw new Error('redemption insert failed');
  return {
    redemptionId: redemption.id,
    rewardId: reward.id,
    costCents: reward.costCents,
  };
}

export async function approveRedemption(input: {
  redemptionId: string;
  parentId: string;
  note?: string | null | undefined;
}): Promise<{ redemptionId: string; newBalanceCents: number }> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({ red: rewardRedemptions, rew: rewards })
      .from(rewardRedemptions)
      .innerJoin(rewards, eq(rewards.id, rewardRedemptions.rewardId))
      .where(
        and(eq(rewardRedemptions.id, input.redemptionId), eq(rewards.parentId, input.parentId)),
      )
      .for('update', { of: rewardRedemptions })
      .limit(1);
    const row = rows[0];
    if (!row) throw new NotFoundError('redemption not found');
    if (row.red.rejectedAt) throw new ConflictError('already rejected');
    if (row.red.approvedAt) {
      // Idempotent re-approve: do nothing further.
      const balRow = (
        await tx.select().from(kidBalances).where(eq(kidBalances.kidId, row.red.kidId)).limit(1)
      )[0];
      return { redemptionId: row.red.id, newBalanceCents: balRow?.balanceCents ?? 0 };
    }

    const credit = await addBalanceEntryInTx(tx, {
      kidId: row.red.kidId,
      amountCents: -row.red.costCents,
      reason: 'redemption',
      referenceId: row.red.id,
      createdBy: input.parentId,
      preventNegative: true,
    });

    await tx
      .update(rewardRedemptions)
      .set({ approvedAt: new Date(), fulfilledAt: new Date(), parentNote: input.note ?? null })
      .where(eq(rewardRedemptions.id, row.red.id));

    return { redemptionId: row.red.id, newBalanceCents: credit.newBalanceCents };
  });
}

export async function rejectRedemption(input: {
  redemptionId: string;
  parentId: string;
  note?: string | null | undefined;
}): Promise<{ redemptionId: string }> {
  const db = getDb();
  const updated = await db
    .update(rewardRedemptions)
    .set({ rejectedAt: new Date(), parentNote: input.note ?? null })
    .where(eq(rewardRedemptions.id, input.redemptionId))
    .returning({ id: rewardRedemptions.id, rewardId: rewardRedemptions.rewardId });
  const row = updated[0];
  if (!row) throw new NotFoundError('redemption not found');
  // Verify ownership.
  const own = (
    await db.select({ id: rewards.id, parentId: rewards.parentId }).from(rewards).where(eq(rewards.id, row.rewardId)).limit(1)
  )[0];
  if (own?.parentId !== input.parentId) {
    await db
      .update(rewardRedemptions)
      .set({ rejectedAt: null })
      .where(eq(rewardRedemptions.id, row.id));
    throw new NotFoundError('redemption not found');
  }
  return { redemptionId: row.id };
}
