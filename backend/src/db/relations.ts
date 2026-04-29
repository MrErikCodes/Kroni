import { relations } from 'drizzle-orm';
import { households, householdInvites } from './schema/households.js';
import { parents } from './schema/parents.js';
import { kids } from './schema/kids.js';
import { pairingCodes, kidDevices, parentDevices } from './schema/pairing.js';
import { tasks, taskCompletions } from './schema/tasks.js';
import { balanceEntries, kidBalances } from './schema/balance.js';
import { rewards, rewardRedemptions } from './schema/rewards.js';

export const householdsRelations = relations(households, ({ many }) => ({
  parents: many(parents),
  kids: many(kids),
  tasks: many(tasks),
  rewards: many(rewards),
  pairingCodes: many(pairingCodes),
  invites: many(householdInvites),
}));

export const householdInvitesRelations = relations(householdInvites, ({ one }) => ({
  household: one(households, {
    fields: [householdInvites.householdId],
    references: [households.id],
  }),
  createdByParent: one(parents, {
    fields: [householdInvites.createdBy],
    references: [parents.id],
  }),
  usedByParent: one(parents, {
    fields: [householdInvites.usedByParentId],
    references: [parents.id],
  }),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  household: one(households, { fields: [parents.householdId], references: [households.id] }),
  kids: many(kids),
  tasks: many(tasks),
  rewards: many(rewards),
  pairingCodes: many(pairingCodes),
  devices: many(parentDevices),
}));

export const kidsRelations = relations(kids, ({ one, many }) => ({
  household: one(households, { fields: [kids.householdId], references: [households.id] }),
  parent: one(parents, { fields: [kids.parentId], references: [parents.id] }),
  balance: one(kidBalances, { fields: [kids.id], references: [kidBalances.kidId] }),
  devices: many(kidDevices),
  completions: many(taskCompletions),
  balanceEntries: many(balanceEntries),
  redemptions: many(rewardRedemptions),
}));

export const pairingCodesRelations = relations(pairingCodes, ({ one }) => ({
  household: one(households, {
    fields: [pairingCodes.householdId],
    references: [households.id],
  }),
  parent: one(parents, { fields: [pairingCodes.parentId], references: [parents.id] }),
  usedByKid: one(kids, { fields: [pairingCodes.usedByKidId], references: [kids.id] }),
}));

export const kidDevicesRelations = relations(kidDevices, ({ one }) => ({
  kid: one(kids, { fields: [kidDevices.kidId], references: [kids.id] }),
}));

export const parentDevicesRelations = relations(parentDevices, ({ one }) => ({
  parent: one(parents, { fields: [parentDevices.parentId], references: [parents.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  household: one(households, { fields: [tasks.householdId], references: [households.id] }),
  parent: one(parents, { fields: [tasks.parentId], references: [parents.id] }),
  kid: one(kids, { fields: [tasks.kidId], references: [kids.id] }),
  completions: many(taskCompletions),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  task: one(tasks, { fields: [taskCompletions.taskId], references: [tasks.id] }),
  kid: one(kids, { fields: [taskCompletions.kidId], references: [kids.id] }),
  approvedByParent: one(parents, { fields: [taskCompletions.approvedBy], references: [parents.id] }),
}));

export const balanceEntriesRelations = relations(balanceEntries, ({ one }) => ({
  kid: one(kids, { fields: [balanceEntries.kidId], references: [kids.id] }),
  createdByParent: one(parents, { fields: [balanceEntries.createdBy], references: [parents.id] }),
}));

export const kidBalancesRelations = relations(kidBalances, ({ one }) => ({
  kid: one(kids, { fields: [kidBalances.kidId], references: [kids.id] }),
}));

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  household: one(households, { fields: [rewards.householdId], references: [households.id] }),
  parent: one(parents, { fields: [rewards.parentId], references: [parents.id] }),
  kid: one(kids, { fields: [rewards.kidId], references: [kids.id] }),
  redemptions: many(rewardRedemptions),
}));

export const rewardRedemptionsRelations = relations(rewardRedemptions, ({ one }) => ({
  reward: one(rewards, { fields: [rewardRedemptions.rewardId], references: [rewards.id] }),
  kid: one(kids, { fields: [rewardRedemptions.kidId], references: [kids.id] }),
}));
