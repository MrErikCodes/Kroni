import type { ParentRow } from '../../db/schema/parents.js';
import type { KidRow } from '../../db/schema/kids.js';
import type { TaskRow } from '../../db/schema/tasks.js';
import type { RewardRow } from '../../db/schema/rewards.js';
import type {
  HouseholdRow,
  HouseholdInviteRow,
} from '../../db/schema/households.js';
import type {
  Parent as ParentDto,
  Kid as KidDto,
  Task as TaskDto,
  Reward as RewardDto,
  Household as HouseholdDto,
  HouseholdMember as HouseholdMemberDto,
  HouseholdInvite as HouseholdInviteDto,
  Locale,
  SubscriptionTier,
  AvatarKey,
  Recurrence,
} from '@kroni/shared';

export function serializeParent(p: ParentRow): ParentDto {
  return {
    id: p.id as ParentDto['id'],
    clerkUserId: p.clerkUserId,
    email: p.email,
    displayName: p.displayName,
    locale: p.locale as Locale,
    subscriptionTier: p.subscriptionTier as SubscriptionTier,
    subscriptionExpiresAt: p.subscriptionExpiresAt
      ? (p.subscriptionExpiresAt.toISOString() as ParentDto['subscriptionExpiresAt'])
      : null,
    createdAt: p.createdAt.toISOString() as ParentDto['createdAt'],
    updatedAt: p.updatedAt.toISOString() as ParentDto['updatedAt'],
  };
}

export function serializeKid(k: KidRow): KidDto {
  return {
    id: k.id as KidDto['id'],
    parentId: (k.parentId as KidDto['parentId']) ?? null,
    name: k.name,
    birthYear: k.birthYear,
    avatarKey: k.avatarKey as AvatarKey | null,
    weeklyAllowanceCents: k.weeklyAllowanceCents as KidDto['weeklyAllowanceCents'],
    createdAt: k.createdAt.toISOString() as KidDto['createdAt'],
  };
}

export function serializeTask(t: TaskRow): TaskDto {
  return {
    id: t.id as TaskDto['id'],
    parentId: (t.parentId as TaskDto['parentId']) ?? null,
    kidId: (t.kidId as TaskDto['kidId']) ?? null,
    title: t.title,
    description: t.description,
    icon: t.icon,
    rewardCents: t.rewardCents as TaskDto['rewardCents'],
    recurrence: t.recurrence as Recurrence,
    daysOfWeek: t.daysOfWeek,
    requiresApproval: t.requiresApproval,
    active: t.active,
    createdAt: t.createdAt.toISOString() as TaskDto['createdAt'],
  };
}

export function serializeReward(r: RewardRow): RewardDto {
  return {
    id: r.id as RewardDto['id'],
    parentId: (r.parentId as RewardDto['parentId']) ?? null,
    kidId: (r.kidId as RewardDto['kidId']) ?? null,
    title: r.title,
    icon: r.icon,
    costCents: r.costCents as RewardDto['costCents'],
    active: r.active,
    createdAt: r.createdAt.toISOString() as RewardDto['createdAt'],
  };
}

export function serializeHousehold(h: HouseholdRow): HouseholdDto {
  return {
    id: h.id as HouseholdDto['id'],
    name: h.name,
    subscriptionTier: h.subscriptionTier as SubscriptionTier,
    subscriptionExpiresAt: h.subscriptionExpiresAt
      ? (h.subscriptionExpiresAt.toISOString() as HouseholdDto['subscriptionExpiresAt'])
      : null,
    premiumOwnerParentId: (h.premiumOwnerParentId as HouseholdDto['premiumOwnerParentId']) ?? null,
    createdAt: h.createdAt.toISOString() as HouseholdDto['createdAt'],
    updatedAt: h.updatedAt.toISOString() as HouseholdDto['updatedAt'],
  };
}

export function serializeHouseholdMember(
  p: ParentRow,
  premiumOwnerParentId: string | null,
): HouseholdMemberDto {
  return {
    id: p.id as HouseholdMemberDto['id'],
    email: p.email,
    displayName: p.displayName,
    isPremiumOwner: premiumOwnerParentId !== null && p.id === premiumOwnerParentId,
    joinedAt: p.createdAt.toISOString() as HouseholdMemberDto['joinedAt'],
  };
}

export function serializeHouseholdInvite(i: HouseholdInviteRow): HouseholdInviteDto {
  return {
    code: i.code,
    householdId: i.householdId as HouseholdInviteDto['householdId'],
    invitedEmail: i.invitedEmail,
    createdBy: i.createdBy as HouseholdInviteDto['createdBy'],
    expiresAt: i.expiresAt.toISOString() as HouseholdInviteDto['expiresAt'],
    usedAt: i.usedAt
      ? (i.usedAt.toISOString() as HouseholdInviteDto['usedAt'])
      : null,
    usedByParentId: (i.usedByParentId as HouseholdInviteDto['usedByParentId']) ?? null,
    createdAt: i.createdAt.toISOString() as HouseholdInviteDto['createdAt'],
  };
}
