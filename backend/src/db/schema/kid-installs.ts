import { pgTable, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { kids } from './kids.js';

// Mirror of parent_installs for the kid app. Same support workflow: a
// blob pasted by the kid (or their parent on their behalf) starts with
// install_id, which joins back to recent activity in this row.
export const kidInstalls = pgTable(
  'kid_installs',
  {
    id: uuid().primaryKey().defaultRandom(),
    kidId: uuid()
      .notNull()
      .references(() => kids.id, { onDelete: 'cascade' }),
    installId: text().notNull(),
    platform: text(),
    appVersion: text(),
    appBuild: text(),
    osVersion: text(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('uq_kid_installs').on(t.kidId, t.installId),
    index('idx_kid_installs_install_id').on(t.installId),
    index('idx_kid_installs_last_seen').on(t.lastSeenAt.desc()),
  ],
);

export type KidInstallRow = typeof kidInstalls.$inferSelect;
export type NewKidInstallRow = typeof kidInstalls.$inferInsert;
