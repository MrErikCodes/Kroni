import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents.js';
import { kids } from './kids.js';

export const balanceEntries = pgTable(
  'balance_entries',
  {
    id: uuid().primaryKey().defaultRandom(),
    kidId: uuid()
      .notNull()
      .references(() => kids.id, { onDelete: 'cascade' }),
    amountCents: integer().notNull(),
    reason: text().notNull(),
    referenceId: uuid(),
    // Snapshot of the underlying task / reward title at the moment the
    // entry was written. We keep this even if the task or reward is later
    // deleted so the history line never collapses to a generic label.
    referenceTitle: text(),
    note: text(),
    createdBy: uuid().references(() => parents.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_balance_kid_time').on(t.kidId, t.createdAt.desc())],
);

export const kidBalances = pgTable('kid_balances', {
  kidId: uuid()
    .primaryKey()
    .references(() => kids.id, { onDelete: 'cascade' }),
  balanceCents: integer().notNull().default(0),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type BalanceEntryRow = typeof balanceEntries.$inferSelect;
export type NewBalanceEntryRow = typeof balanceEntries.$inferInsert;
export type KidBalanceRow = typeof kidBalances.$inferSelect;
