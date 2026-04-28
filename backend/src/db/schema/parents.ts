import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const parents = pgTable('parents', {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text().unique().notNull(),
  email: text().notNull(),
  displayName: text(),
  locale: text().notNull().default('nb-NO'),
  subscriptionTier: text().notNull().default('free'),
  subscriptionExpiresAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type ParentRow = typeof parents.$inferSelect;
export type NewParentRow = typeof parents.$inferInsert;
