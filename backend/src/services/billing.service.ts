import { eq, and } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids } from '../db/schema/kids.js';
import { tasks } from '../db/schema/tasks.js';
import { PaymentRequiredError } from '../lib/errors.js';
import type { ParentRow } from '../db/schema/parents.js';

const FREE_KID_LIMIT = 1;
const FREE_ACTIVE_TASK_LIMIT = 5;

export type Tier = 'free' | 'family' | 'premium';

export function isPaid(parent: ParentRow): boolean {
  if (parent.subscriptionTier === 'free') return false;
  if (!parent.subscriptionExpiresAt) return false;
  return parent.subscriptionExpiresAt.getTime() > Date.now();
}

// Throws PaymentRequiredError when adding one more kid would exceed the parent's plan.
export async function assertCanAddKid(parent: ParentRow): Promise<void> {
  if (isPaid(parent)) return;
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(kids)
    .where(eq(kids.parentId, parent.id));
  if ((row?.n ?? 0) >= FREE_KID_LIMIT) {
    throw new PaymentRequiredError(
      `free plan allows ${FREE_KID_LIMIT} kid; upgrade to family for more`,
    );
  }
}

// Throws when a new active task would push the parent past the active-task cap.
export async function assertCanAddActiveTask(parent: ParentRow): Promise<void> {
  if (isPaid(parent)) return;
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(tasks)
    .where(and(eq(tasks.parentId, parent.id), eq(tasks.active, true)));
  if ((row?.n ?? 0) >= FREE_ACTIVE_TASK_LIMIT) {
    throw new PaymentRequiredError(
      `free plan allows ${FREE_ACTIVE_TASK_LIMIT} active tasks; upgrade to family for more`,
    );
  }
}
