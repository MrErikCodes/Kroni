import { and, count, eq, gt, isNull, ne } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { households, householdInvites, type HouseholdRow } from '../db/schema/households.js';
import { parents, type ParentRow } from '../db/schema/parents.js';
import { kids } from '../db/schema/kids.js';
import { tasks } from '../db/schema/tasks.js';
import { rewards } from '../db/schema/rewards.js';
import { generatePairingCode } from '../lib/codes.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../lib/errors.js';

const INVITE_TTL_DAYS = 7;
const INVITE_TTL_SEC = INVITE_TTL_DAYS * 24 * 60 * 60;

export interface CreatedHouseholdInvite {
  code: string;
  expiresAt: Date;
}

// Returns the parent's existing household, or creates a new one and
// assigns the parent to it. Idempotent — safe to call repeatedly.
export async function ensureHouseholdForParent(parent: ParentRow): Promise<HouseholdRow> {
  const db = getDb();

  if (parent.householdId) {
    const rows = await db
      .select()
      .from(households)
      .where(eq(households.id, parent.householdId))
      .limit(1);
    const existing = rows[0];
    if (existing) return existing;
    // householdId points at a vanished row — fall through and re-create.
  }

  return db.transaction(async (tx) => {
    // Re-check inside the tx in case a concurrent request already created one.
    const fresh = await tx
      .select()
      .from(parents)
      .where(eq(parents.id, parent.id))
      .for('update')
      .limit(1);
    const freshParent = fresh[0];
    if (!freshParent) throw new UnauthorizedError('parent missing');
    if (freshParent.householdId) {
      const hh = await tx
        .select()
        .from(households)
        .where(eq(households.id, freshParent.householdId))
        .limit(1);
      const existing = hh[0];
      if (existing) return existing;
    }

    const inserted = await tx
      .insert(households)
      .values({
        subscriptionTier: freshParent.subscriptionTier,
        subscriptionExpiresAt: freshParent.subscriptionExpiresAt,
        premiumOwnerParentId: freshParent.id,
      })
      .returning();
    const household = inserted[0];
    if (!household) throw new Error('household insert failed');

    await tx
      .update(parents)
      .set({ householdId: household.id, updatedAt: new Date() })
      .where(eq(parents.id, freshParent.id));

    return household;
  });
}

// Generate a 6-digit invite code unique among non-expired non-used codes.
// Mirrors createPairingCode: PK collision retry up to 5 times.
export async function createHouseholdInvite(
  householdId: string,
  createdByParentId: string,
  invitedEmail?: string | null,
): Promise<CreatedHouseholdInvite> {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + INVITE_TTL_SEC * 1000);
    try {
      await db.insert(householdInvites).values({
        code,
        householdId,
        createdBy: createdByParentId,
        invitedEmail: invitedEmail ?? null,
        expiresAt,
      });
      return { code, expiresAt };
    } catch (err) {
      const pgCode = (err as { code?: string }).code;
      if (pgCode !== '23505') throw err;
    }
  }
  throw new ConflictError('failed to generate unique invite code after 5 attempts');
}

// Atomic accept: lock invite row, verify not used + not expired, set
// parent.householdId, mark invite used. 401 if invalid/expired/used.
// Rejects if the parent already belongs to a different household.
export async function acceptHouseholdInvite(
  code: string,
  parentId: string,
): Promise<{ householdId: string }> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const inviteRows = await tx
      .select()
      .from(householdInvites)
      .where(
        and(
          eq(householdInvites.code, code),
          isNull(householdInvites.usedAt),
          gt(householdInvites.expiresAt, sql`now()`),
        ),
      )
      .for('update')
      .limit(1);
    const invite = inviteRows[0];
    if (!invite) throw new UnauthorizedError('invalid or expired invite code');

    const parentRows = await tx
      .select()
      .from(parents)
      .where(eq(parents.id, parentId))
      .for('update')
      .limit(1);
    const parent = parentRows[0];
    if (!parent) throw new UnauthorizedError('parent not found');

    if (parent.householdId && parent.householdId !== invite.householdId) {
      // The auth plugin auto-creates a placeholder household for every
      // parent. If this parent is the sole member of their current household
      // AND that household has no kids/tasks/rewards, it's a fresh
      // placeholder safe to delete. Otherwise refuse — the parent must
      // explicitly leave first.
      const oldHouseholdId = parent.householdId;

      const [memberCount] = await tx
        .select({ n: count() })
        .from(parents)
        .where(and(eq(parents.householdId, oldHouseholdId), ne(parents.id, parentId)));
      const [kidCount] = await tx
        .select({ n: count() })
        .from(kids)
        .where(eq(kids.householdId, oldHouseholdId));
      const [taskCount] = await tx
        .select({ n: count() })
        .from(tasks)
        .where(eq(tasks.householdId, oldHouseholdId));
      const [rewardCount] = await tx
        .select({ n: count() })
        .from(rewards)
        .where(eq(rewards.householdId, oldHouseholdId));

      const isEmptyPlaceholder =
        (memberCount?.n ?? 0) === 0 &&
        (kidCount?.n ?? 0) === 0 &&
        (taskCount?.n ?? 0) === 0 &&
        (rewardCount?.n ?? 0) === 0;

      if (!isEmptyPlaceholder) {
        throw new BadRequestError(
          'parent already belongs to a household with data; leave it before joining another',
        );
      }

      await tx
        .update(parents)
        .set({ householdId: invite.householdId, updatedAt: new Date() })
        .where(eq(parents.id, parentId));

      // Drop the now-empty placeholder household.
      await tx.delete(households).where(eq(households.id, oldHouseholdId));
    } else {
      await tx
        .update(parents)
        .set({ householdId: invite.householdId, updatedAt: new Date() })
        .where(eq(parents.id, parentId));
    }

    await tx
      .update(householdInvites)
      .set({ usedAt: new Date(), usedByParentId: parentId })
      .where(eq(householdInvites.code, code));

    return { householdId: invite.householdId };
  });
}

// Members of a household, ordered by signup time so the original creator
// appears first. Used by GET /parent/household/me.
export async function listHouseholdMembers(householdId: string): Promise<ParentRow[]> {
  const db = getDb();
  return db
    .select()
    .from(parents)
    .where(eq(parents.householdId, householdId))
    .orderBy(parents.createdAt);
}

// Fetch a household by id; throws 404 if missing.
export async function getHouseholdById(id: string): Promise<HouseholdRow> {
  const db = getDb();
  const rows = await db.select().from(households).where(eq(households.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new NotFoundError('household not found');
  return row;
}

// List active (non-used, non-expired) invites for a household.
export async function listActiveInvites(householdId: string) {
  const db = getDb();
  return db
    .select()
    .from(householdInvites)
    .where(
      and(
        eq(householdInvites.householdId, householdId),
        isNull(householdInvites.usedAt),
        gt(householdInvites.expiresAt, sql`now()`),
      ),
    )
    .orderBy(householdInvites.createdAt);
}

// Revoke an invite. Returns true if a row was deleted.
export async function revokeInvite(householdId: string, code: string): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(householdInvites)
    .where(and(eq(householdInvites.code, code), eq(householdInvites.householdId, householdId)))
    .returning({ code: householdInvites.code });
  return deleted.length > 0;
}
