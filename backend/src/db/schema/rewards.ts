import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents.js';
import { kids } from './kids.js';

export const rewards = pgTable(
  'rewards',
  {
    id: uuid().primaryKey().defaultRandom(),
    parentId: uuid()
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    kidId: uuid().references(() => kids.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    icon: text(),
    costCents: integer().notNull(),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_rewards_parent_active').on(t.parentId, t.active)],
);

export const rewardRedemptions = pgTable(
  'reward_redemptions',
  {
    id: uuid().primaryKey().defaultRandom(),
    rewardId: uuid()
      .notNull()
      .references(() => rewards.id, { onDelete: 'cascade' }),
    kidId: uuid()
      .notNull()
      .references(() => kids.id, { onDelete: 'cascade' }),
    costCents: integer().notNull(),
    requestedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp({ withTimezone: true }),
    fulfilledAt: timestamp({ withTimezone: true }),
    rejectedAt: timestamp({ withTimezone: true }),
    parentNote: text(),
  },
  (t) => [index('idx_redemptions_kid_time').on(t.kidId, t.requestedAt.desc())],
);

export type RewardRow = typeof rewards.$inferSelect;
export type NewRewardRow = typeof rewards.$inferInsert;
export type RewardRedemptionRow = typeof rewardRedemptions.$inferSelect;
export type NewRewardRedemptionRow = typeof rewardRedemptions.$inferInsert;
