import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { parents } from './parents.js';
import { kids } from './kids.js';
import { households } from './households.js';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),
    // Household scope — the unit of ownership.
    householdId: uuid()
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    // Creator parent (audit only). Nullable on parent delete so co-parents
    // retain visibility into tasks the original creator made.
    parentId: uuid().references(() => parents.id, { onDelete: 'set null' }),
    kidId: uuid().references(() => kids.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    description: text(),
    icon: text(),
    rewardCents: integer().notNull(),
    recurrence: text().notNull(),
    daysOfWeek: integer().array(),
    requiresApproval: boolean().notNull().default(true),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_tasks_kid_active').on(t.kidId, t.active).where(sql`${t.active} = true`),
    index('idx_tasks_household_active')
      .on(t.householdId, t.active)
      .where(sql`${t.active} = true`),
  ],
);

export const taskCompletions = pgTable(
  'task_completions',
  {
    id: uuid().primaryKey().defaultRandom(),
    taskId: uuid()
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    kidId: uuid()
      .notNull()
      .references(() => kids.id, { onDelete: 'cascade' }),
    scheduledFor: date().notNull(),
    completedAt: timestamp({ withTimezone: true }),
    approvedAt: timestamp({ withTimezone: true }),
    approvedBy: uuid().references(() => parents.id),
    rejectedAt: timestamp({ withTimezone: true }),
    rewardCents: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('uq_completion_per_day').on(t.taskId, t.kidId, t.scheduledFor),
    index('idx_completions_kid_date').on(t.kidId, t.scheduledFor.desc()),
  ],
);

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type TaskCompletionRow = typeof taskCompletions.$inferSelect;
export type NewTaskCompletionRow = typeof taskCompletions.$inferInsert;
