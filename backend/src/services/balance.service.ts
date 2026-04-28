import { eq, and, gte, sum } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { balanceEntries, kidBalances } from '../db/schema/balance.js';
import { startOfWeekInAppTz } from '../lib/time.js';
import { ConflictError } from '../lib/errors.js';

export type BalanceReason = 'task' | 'allowance' | 'redemption' | 'adjustment' | 'gift' | 'reversal';

export interface AddEntryInput {
  kidId: string;
  amountCents: number; // signed: positive = credit, negative = debit
  reason: BalanceReason;
  referenceId?: string | null;
  /**
   * Plaintext snapshot of the underlying task / reward title (or "Lommepenger"
   * for allowance) — written so the kid + parent history can show the actual
   * thing, and so the line survives deletion of the source row.
   */
  referenceTitle?: string | null;
  note?: string | null;
  createdBy?: string | null;
  /** When true, refuse to write the entry if it would push balance negative. */
  preventNegative?: boolean;
}

// Drizzle's transaction callback exposes a tx with a slightly different type than the
// top-level Db (no $client property). We accept whichever via a structural type guard
// so callers can either start their own transaction or pass an outer one through.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxLike = any;

// Inner implementation — assumes caller already opened a transaction. SELECT FOR UPDATE
// pins the kid_balances row so concurrent writers serialize.
export async function addBalanceEntryInTx(
  tx: TxLike,
  input: AddEntryInput,
): Promise<{ newBalanceCents: number; entryId: string }> {
  const balRows = await tx
    .select()
    .from(kidBalances)
    .where(eq(kidBalances.kidId, input.kidId))
    .for('update')
    .limit(1);

  const current = balRows[0]?.balanceCents ?? 0;
  const next = current + input.amountCents;

  if (input.preventNegative && next < 0) {
    throw new ConflictError('insufficient balance');
  }

  const inserted = await tx
    .insert(balanceEntries)
    .values({
      kidId: input.kidId,
      amountCents: input.amountCents,
      reason: input.reason,
      referenceId: input.referenceId ?? null,
      referenceTitle: input.referenceTitle ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy ?? null,
    })
    .returning({ id: balanceEntries.id });
  const entryId = inserted[0]?.id;
  if (!entryId) throw new Error('balance entry insert failed');

  if (balRows.length === 0) {
    await tx.insert(kidBalances).values({ kidId: input.kidId, balanceCents: next });
  } else {
    await tx
      .update(kidBalances)
      .set({ balanceCents: next, updatedAt: new Date() })
      .where(eq(kidBalances.kidId, input.kidId));
  }

  return { newBalanceCents: next, entryId };
}

// Convenience wrapper that opens its own transaction. Use this when callers don't
// already have one. Always atomic.
export async function addBalanceEntry(
  input: AddEntryInput,
): Promise<{ newBalanceCents: number; entryId: string }> {
  return getDb().transaction((tx) => addBalanceEntryInTx(tx, input));
}

// Sum every balance entry for a kid and return the value. Used for invariant checks.
export async function recomputeBalance(kidId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ total: sum(balanceEntries.amountCents).mapWith(Number) })
    .from(balanceEntries)
    .where(eq(balanceEntries.kidId, kidId));
  return row?.total ?? 0;
}

export interface BalanceSummary {
  balanceCents: number;
  weekEarnedCents: number;
  weekSpentCents: number;
}

export async function getBalanceSummary(kidId: string): Promise<BalanceSummary> {
  const db = getDb();
  const balRows = await db
    .select()
    .from(kidBalances)
    .where(eq(kidBalances.kidId, kidId))
    .limit(1);
  const balance = balRows[0]?.balanceCents ?? 0;

  const weekStart = startOfWeekInAppTz();
  const weekRows = await db
    .select({
      earned: sql<number>`COALESCE(SUM(CASE WHEN ${balanceEntries.amountCents} > 0 THEN ${balanceEntries.amountCents} ELSE 0 END), 0)::int`,
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${balanceEntries.amountCents} < 0 THEN -${balanceEntries.amountCents} ELSE 0 END), 0)::int`,
    })
    .from(balanceEntries)
    .where(and(eq(balanceEntries.kidId, kidId), gte(balanceEntries.createdAt, weekStart)));
  const week = weekRows[0];
  return {
    balanceCents: balance,
    weekEarnedCents: week?.earned ?? 0,
    weekSpentCents: week?.spent ?? 0,
  };
}
