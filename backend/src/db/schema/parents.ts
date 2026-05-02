import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { households } from './households.js';

export const parents = pgTable('parents', {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text().unique().notNull(),
  email: text().notNull(),
  displayName: text(),
  locale: text().notNull().default('nb-NO'),
  // ISO 4217 — one of NOK, SEK, DKK. Default NOK; the mobile client
  // patches this to SEK/DKK on first sign-in based on device region
  // when the parent is freshly created.
  currency: text().notNull().default('NOK'),
  // Household this parent belongs to. Nullable so a freshly-inserted parent
  // (Clerk webhook) can briefly exist before ensureHouseholdForParent runs.
  householdId: uuid().references(() => households.id, { onDelete: 'set null' }),
  // Denormalized cache of the household's tier. Kept for backwards-compat
  // with serializers; authoritative gate reads household.subscriptionTier.
  // TODO household: drop this column in a follow-up migration once all
  // callers migrate to household tier.
  subscriptionTier: text().notNull().default('free'),
  subscriptionExpiresAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type ParentRow = typeof parents.$inferSelect;
export type NewParentRow = typeof parents.$inferInsert;
