import { z } from 'zod';
import { UUID, IsoTimestamp, SubscriptionTier } from './common.js';

export const HouseholdSchema = z.object({
  id: UUID,
  name: z.string().min(1).max(80).nullable(),
  subscriptionTier: SubscriptionTier,
  subscriptionExpiresAt: IsoTimestamp.nullable(),
  premiumOwnerParentId: UUID.nullable(),
  createdAt: IsoTimestamp,
  updatedAt: IsoTimestamp,
});
export type Household = z.infer<typeof HouseholdSchema>;

export const HouseholdMemberSchema = z.object({
  id: UUID,
  email: z.string().email(),
  displayName: z.string().min(1).max(80).nullable(),
  isPremiumOwner: z.boolean(),
  joinedAt: IsoTimestamp,
});
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;

export const HouseholdSummarySchema = z.object({
  household: HouseholdSchema,
  members: z.array(HouseholdMemberSchema),
});
export type HouseholdSummary = z.infer<typeof HouseholdSummarySchema>;

export const HouseholdInviteCodeRegex = /^\d{6}$/;

export const HouseholdInviteSchema = z.object({
  code: z.string().regex(HouseholdInviteCodeRegex),
  householdId: UUID,
  invitedEmail: z.string().email().nullable(),
  createdBy: UUID,
  expiresAt: IsoTimestamp,
  usedAt: IsoTimestamp.nullable(),
  usedByParentId: UUID.nullable(),
  createdAt: IsoTimestamp,
});
export type HouseholdInvite = z.infer<typeof HouseholdInviteSchema>;

export const CreateHouseholdInviteSchema = z.object({
  invitedEmail: z.string().email().max(254).optional(),
});
export type CreateHouseholdInviteInput = z.infer<typeof CreateHouseholdInviteSchema>;

export const CreateHouseholdInviteResponseSchema = z.object({
  code: z.string().regex(HouseholdInviteCodeRegex),
  expiresAt: IsoTimestamp,
});
export type CreateHouseholdInviteResponse = z.infer<typeof CreateHouseholdInviteResponseSchema>;

export const JoinHouseholdRequestSchema = z.object({
  code: z.string().regex(HouseholdInviteCodeRegex),
});
export type JoinHouseholdRequest = z.infer<typeof JoinHouseholdRequestSchema>;

export const JoinHouseholdResponseSchema = z.object({
  householdId: UUID,
});
export type JoinHouseholdResponse = z.infer<typeof JoinHouseholdResponseSchema>;
