import { pgTable, uuid, char, text, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { parents } from './parents.js';
import { kids } from './kids.js';
import { households } from './households.js';

export const pairingCodes = pgTable(
  'pairing_codes',
  {
    code: char({ length: 6 }).primaryKey(),
    // Household scope — any parent in the household can issue / redeem.
    householdId: uuid()
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    // Creator parent (audit). Nullable on parent delete.
    parentId: uuid().references(() => parents.id, { onDelete: 'set null' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    usedByKidId: uuid().references(() => kids.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_pairing_expires').on(t.expiresAt).where(sql`${t.usedAt} IS NULL`),
  ],
);

export const kidDevices = pgTable(
  'kid_devices',
  {
    id: uuid().primaryKey().defaultRandom(),
    kidId: uuid()
      .notNull()
      .references(() => kids.id, { onDelete: 'cascade' }),
    deviceId: text().notNull(),
    pushToken: text(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_kid_device').on(t.kidId, t.deviceId)],
);

export type PairingCodeRow = typeof pairingCodes.$inferSelect;
export type NewPairingCodeRow = typeof pairingCodes.$inferInsert;
export type KidDeviceRow = typeof kidDevices.$inferSelect;
