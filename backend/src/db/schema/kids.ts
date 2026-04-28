import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents.js';
import { households } from './households.js';

export const kids = pgTable(
  'kids',
  {
    id: uuid().primaryKey().defaultRandom(),
    // Household owns the kid (subscription gating, co-parent visibility).
    householdId: uuid()
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    // Creator parent — kept for audit; not the ownership scope anymore.
    // Nullable on parent delete so a co-parent's kid survives when the
    // original creator's account is removed.
    parentId: uuid().references(() => parents.id, { onDelete: 'set null' }),
    name: text().notNull(),
    birthYear: integer(),
    avatarKey: text(),
    pin: text(),
    weeklyAllowanceCents: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_kids_household').on(t.householdId)],
);

export type KidRow = typeof kids.$inferSelect;
export type NewKidRow = typeof kids.$inferInsert;
