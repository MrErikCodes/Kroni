import { z } from 'zod';
import { UUID, IsoTimestamp, Cents } from './common.js';

export const RewardSchema = z.object({
  id: UUID,
  // Creator parent (audit). Nullable post-creator-deletion.
  parentId: UUID.nullable(),
  kidId: UUID.nullable(),
  title: z.string().min(1).max(80),
  icon: z.string().max(40).nullable(),
  costCents: Cents,
  active: z.boolean(),
  createdAt: IsoTimestamp,
});
export type Reward = z.infer<typeof RewardSchema>;

export const CreateRewardSchema = z.object({
  kidId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(80),
  icon: z.string().max(40).optional(),
  costCents: z.number().int().min(0).max(10_000_000),
  active: z.boolean().default(true),
});
export type CreateRewardInput = z.infer<typeof CreateRewardSchema>;

export const UpdateRewardSchema = CreateRewardSchema.partial();
export type UpdateRewardInput = z.infer<typeof UpdateRewardSchema>;

export const RedemptionStatus = z.enum(['requested', 'approved', 'fulfilled', 'rejected']);
export type RedemptionStatus = z.infer<typeof RedemptionStatus>;

export const RewardRedemptionSchema = z.object({
  id: UUID,
  rewardId: UUID,
  kidId: UUID,
  costCents: Cents,
  requestedAt: IsoTimestamp,
  approvedAt: IsoTimestamp.nullable(),
  fulfilledAt: IsoTimestamp.nullable(),
  rejectedAt: IsoTimestamp.nullable(),
  parentNote: z.string().max(500).nullable(),
});
export type RewardRedemption = z.infer<typeof RewardRedemptionSchema>;
