import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents.js';

export const kids = pgTable(
  'kids',
  {
    id: uuid().primaryKey().defaultRandom(),
    parentId: uuid()
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    birthYear: integer(),
    avatarKey: text(),
    pin: text(),
    weeklyAllowanceCents: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_kids_parent').on(t.parentId)],
);

export type KidRow = typeof kids.$inferSelect;
export type NewKidRow = typeof kids.$inferInsert;
