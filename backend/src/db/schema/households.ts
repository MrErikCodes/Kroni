import { pgTable, uuid, char, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { parents } from './parents.js';

export const households = pgTable('households', {
  id: uuid().primaryKey().defaultRandom(),
  name: text(),
  // Denormalized snapshot of the household plan. RevenueCat webhook
  // updates this when the premium-owner parent buys / cancels.
  subscriptionTier: text().notNull().default('free'),
  subscriptionExpiresAt: timestamp({ withTimezone: true }),
  // True when the household has bought the lifetime IAP (`kroni_lifetime`).
  // Independent of subscriptionTier so a lifetime owner survives a future
  // tier rename and can't accidentally lose access when a recurring sub
  // expires. `isHouseholdPaid` returns true if either is set.
  lifetimePaid: boolean().notNull().default(false),
  // Nullable until a parent buys a subscription. References parents(id) at
  // application level only (no FK to avoid circular dependency with
  // parents.householdId — both tables are populated together in the
  // ensureHouseholdForParent flow).
  premiumOwnerParentId: uuid(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const householdInvites = pgTable(
  'household_invites',
  {
    code: char({ length: 6 }).primaryKey(),
    householdId: uuid()
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    invitedEmail: text(),
    createdBy: uuid()
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    usedByParentId: uuid().references(() => parents.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_household_invites_expires')
      .on(t.expiresAt)
      .where(sql`${t.usedAt} IS NULL`),
    index('idx_household_invites_household').on(t.householdId),
  ],
);

export type HouseholdRow = typeof households.$inferSelect;
export type NewHouseholdRow = typeof households.$inferInsert;
export type HouseholdInviteRow = typeof householdInvites.$inferSelect;
export type NewHouseholdInviteRow = typeof householdInvites.$inferInsert;
