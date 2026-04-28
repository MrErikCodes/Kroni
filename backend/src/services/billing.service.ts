import { eq, and } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids } from '../db/schema/kids.js';
import { tasks } from '../db/schema/tasks.js';
import { PaymentRequiredError } from '../lib/errors.js';
import type { HouseholdRow } from '../db/schema/households.js';

const FREE_KID_LIMIT = 1;
const FREE_ACTIVE_TASK_LIMIT = 5;

export type Tier = 'free' | 'family';

export function isHouseholdPaid(household: HouseholdRow): boolean {
  if (household.subscriptionTier === 'free') return false;
  if (!household.subscriptionExpiresAt) return false;
  return household.subscriptionExpiresAt.getTime() > Date.now();
}

// Throws PaymentRequiredError when adding one more kid would exceed the
// household's plan. Scoped on household rather than parent so a co-parent
// inherits the buyer's premium.
export async function assertCanAddKid(household: HouseholdRow): Promise<void> {
  if (isHouseholdPaid(household)) return;
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(kids)
    .where(eq(kids.householdId, household.id));
  if ((row?.n ?? 0) >= FREE_KID_LIMIT) {
    throw new PaymentRequiredError(
      `free plan allows ${FREE_KID_LIMIT} kid; upgrade to family for more`,
    );
  }
}

// Throws when a new active task would push the household past the active-task cap.
export async function assertCanAddActiveTask(household: HouseholdRow): Promise<void> {
  if (isHouseholdPaid(household)) return;
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(tasks)
    .where(and(eq(tasks.householdId, household.id), eq(tasks.active, true)));
  if ((row?.n ?? 0) >= FREE_ACTIVE_TASK_LIMIT) {
    throw new PaymentRequiredError(
      `free plan allows ${FREE_ACTIVE_TASK_LIMIT} active tasks; upgrade to family for more`,
    );
  }
}
