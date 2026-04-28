import { pgTable, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { parents } from './parents.js';

// One row per (parent, install). Upserted on every authenticated request
// so `last_seen_at` doubles as activity tracking. Lets support join from
// the install_id pasted by a user back to recent server-side state.
export const parentInstalls = pgTable(
  'parent_installs',
  {
    id: uuid().primaryKey().defaultRandom(),
    parentId: uuid()
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    installId: text().notNull(),
    platform: text(),
    appVersion: text(),
    appBuild: text(),
    osVersion: text(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('uq_parent_installs').on(t.parentId, t.installId),
    index('idx_parent_installs_install_id').on(t.installId),
    index('idx_parent_installs_last_seen').on(t.lastSeenAt.desc()),
  ],
);

export type ParentInstallRow = typeof parentInstalls.$inferSelect;
export type NewParentInstallRow = typeof parentInstalls.$inferInsert;
