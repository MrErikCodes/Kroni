import { z } from 'zod';
import { UUID, IsoTimestamp, SignedCents, Cents } from './common.js';

export const BalanceReason = z.enum([
  'task',
  'allowance',
  'redemption',
  'adjustment',
  'gift',
  'reversal',
]);
export type BalanceReason = z.infer<typeof BalanceReason>;

export const BalanceEntrySchema = z.object({
  id: UUID,
  kidId: UUID,
  amountCents: SignedCents,
  reason: BalanceReason,
  referenceId: UUID.nullable(),
  note: z.string().max(500).nullable(),
  createdBy: UUID.nullable(),
  createdAt: IsoTimestamp,
});
export type BalanceEntry = z.infer<typeof BalanceEntrySchema>;

export const BalanceSummarySchema = z.object({
  balanceCents: Cents,
  weekEarnedCents: Cents,
  weekSpentCents: Cents,
});
export type BalanceSummary = z.infer<typeof BalanceSummarySchema>;

export const BalanceAdjustSchema = z.object({
  kidId: z.string().uuid(),
  amountCents: z.number().int().refine((n) => n !== 0, 'amount must be non-zero'),
  reason: z.enum(['adjustment', 'gift', 'reversal']),
  note: z.string().max(500).optional(),
});
export type BalanceAdjustInput = z.infer<typeof BalanceAdjustSchema>;
