import { z } from 'zod';
import { UUID, IsoTimestamp, Locale, Currency, SubscriptionTier } from './common.js';

export const ParentSchema = z.object({
  id: UUID,
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1).max(80).nullable(),
  locale: Locale.default('nb-NO'),
  currency: Currency.default('NOK'),
  subscriptionTier: SubscriptionTier,
  subscriptionExpiresAt: IsoTimestamp.nullable(),
  createdAt: IsoTimestamp,
  updatedAt: IsoTimestamp,
});
export type Parent = z.infer<typeof ParentSchema>;

export const UpdateParentSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  locale: Locale.optional(),
  currency: Currency.optional(),
});
export type UpdateParentInput = z.infer<typeof UpdateParentSchema>;
