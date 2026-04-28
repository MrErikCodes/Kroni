import { z } from 'zod';

// Branded types — runtime is the underlying primitive, type system enforces tagging.

export const UUID = z.string().uuid().brand<'UUID'>();
export type UUID = z.infer<typeof UUID>;

export const IsoTimestamp = z.string().datetime({ offset: true }).brand<'IsoTimestamp'>();
export type IsoTimestamp = z.infer<typeof IsoTimestamp>;

export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .brand<'IsoDate'>();
export type IsoDate = z.infer<typeof IsoDate>;

// Money — integer øre. 1 NOK = 100 øre.
export const Cents = z.number().int().nonnegative().brand<'Cents'>();
export type Cents = z.infer<typeof Cents>;

export const SignedCents = z.number().int().brand<'SignedCents'>();
export type SignedCents = z.infer<typeof SignedCents>;

export const Locale = z.enum(['nb-NO', 'sv-SE', 'da-DK', 'en-US']);
export type Locale = z.infer<typeof Locale>;

// One paid tier; `family` is the only entitlement we sell. A future
// higher tier would be a new value here (and a corresponding RC product).
export const SubscriptionTier = z.enum(['free', 'family']);
export type SubscriptionTier = z.infer<typeof SubscriptionTier>;

export const PaginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

// Fixed catalog of avatar keys kids may pick. Avoids photo uploads (privacy).
export const AvatarKey = z.enum([
  'fox', 'bear', 'rabbit', 'owl',
  'penguin', 'lion', 'panda', 'cat',
  'dog', 'unicorn', 'dragon', 'astronaut',
]);
export type AvatarKey = z.infer<typeof AvatarKey>;
