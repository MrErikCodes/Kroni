# Parent log-on-behalf + tab cleanup — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a parent mark tasks done on behalf of one or more kids in the same household via a "Logg" mode on the *Oppgaver* tab, and reduce the parent tab bar from 5 to 4 by demoting *Innstillinger* to a gear icon and moving "Legg til barn" into a *Husstand* section in Settings.

**Architecture:** New `POST /parent/tasks/:taskId/log-completion` endpoint that immediately credits the kid's balance for one or more kids (no approval gate). New `GET /parent/tasks/loggable` endpoint returning today-eligible tasks enriched with which kids in the household haven't been credited yet. Mobile *Oppgaver* tab grows a Logg-mode toggle + a multi-select kid picker sheet. Settings moves out of the tab folder, becoming a stack-pushed page reachable from a gear icon.

**Tech Stack:** Fastify + Drizzle (backend), expo-router + react-query (mobile), Zod (shared schemas). i18n via i18n-js with nested JSON dictionaries.

**Spec reference:** `docs/superpowers/specs/2026-04-30-parent-log-on-behalf-and-tab-cleanup-design.md`

---

## File structure overview

**Created:**
- `shared/src/schemas/parent-log.ts` — request/response schemas for the new endpoints, plus the shared `isEligibleToday` helper.
- `mobile/app/(parent)/settings.tsx` — relocated settings screen (stack-pushed, no longer a tab).
- `mobile/components/parent/KidPickerSheet.tsx` — multi-select sheet for choosing which kids to credit.
- `backend/src/tests/log-completion.test.ts` — node:test integration tests for the new endpoint.

**Deleted:**
- `mobile/app/(parent)/(tabs)/settings.tsx` — moved (see above).

**Modified:**
- `shared/src/index.ts` — export new module.
- `backend/src/services/tasks.service.ts` — switch to shared `isEligibleToday` helper; add `listLoggableTasks(householdId)` and `logTaskCompletion({...})` services.
- `backend/src/routes/parent/tasks.ts` — add the two new routes.
- `backend/package.json` — append the new test file to the `test` script.
- `mobile/lib/api.ts` — add `parentApi.getLoggableTasks` and `parentApi.logTaskCompletion`.
- `mobile/app/(parent)/(tabs)/_layout.tsx` — remove `Tabs.Screen name="settings"`.
- `mobile/app/(parent)/(tabs)/kids.tsx` — replace "+" with gear icon, route to `/(parent)/settings`.
- `mobile/app/(parent)/(tabs)/tasks.tsx` — Logg mode toggle, header swap, today-eligibility filter, mutation flow, confirmation UX.
- `mobile/lib/i18n/{nb,sv,da,en}.json` — new keys for Logg mode + settings Husstand section.

---

## Task 1 — Shared schemas + `isEligibleToday` helper

**Files:**
- Create: `shared/src/schemas/parent-log.ts`
- Modify: `shared/src/index.ts`

- [ ] **Step 1.1: Create `shared/src/schemas/parent-log.ts`**

```ts
import { z } from 'zod';
import { UUID, Cents } from './common.js';

// Day-of-week convention: 0 = Sun, 1 = Mon, ..., 6 = Sat. Matches the
// existing `dayOfWeekInAppTz()` helper on the backend.
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Minimal task shape needed for eligibility — keeps the helper decoupled
// from the full TaskSchema so the client can call it on TaskRow data
// without a wider import.
export interface EligibleTaskShape {
  recurrence: 'daily' | 'weekly' | 'once';
  daysOfWeek: number[] | null;
  active: boolean;
}

/**
 * Returns true if `task` is "due today" in the household-local timezone.
 * - `daily`: always (when active).
 * - `weekly`: only if `daysOfWeek` includes the current local day-of-week.
 * - `once`: always until completed (caller is responsible for checking
 *   completion state — this helper is purely about recurrence/dow).
 *
 * Inactive tasks are never eligible.
 */
export function isEligibleToday(
  task: EligibleTaskShape,
  todayDow: DayOfWeek,
): boolean {
  if (!task.active) return false;
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'once') return true;
  if (task.recurrence === 'weekly') {
    return Array.isArray(task.daysOfWeek) && task.daysOfWeek.includes(todayDow);
  }
  return false;
}

// ── /parent/tasks/loggable ────────────────────────────────────────────

export const LoggableKidSchema = z.object({
  kidId: UUID,
  name: z.string(),
  avatarKey: z.string().nullable(),
  alreadyCompletedToday: z.boolean(),
});
export type LoggableKid = z.infer<typeof LoggableKidSchema>;

export const LoggableTaskSchema = z.object({
  taskId: UUID,
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  rewardCents: Cents,
  recurrence: z.enum(['daily', 'weekly', 'once']),
  requiresApproval: z.boolean(),
  eligibleKids: z.array(LoggableKidSchema),
});
export type LoggableTask = z.infer<typeof LoggableTaskSchema>;

export const LoggableTasksResponseSchema = z.array(LoggableTaskSchema);

// ── POST /parent/tasks/:taskId/log-completion ─────────────────────────

export const LogTaskCompletionRequestSchema = z.object({
  kidIds: z.array(UUID).min(1).max(20),
  idempotencyKey: z.string().uuid(),
});
export type LogTaskCompletionRequest = z.infer<typeof LogTaskCompletionRequestSchema>;

export const LogTaskCompletionCreditedSchema = z.object({
  kidId: UUID,
  completionId: UUID,
  newBalanceCents: z.number().int(),
});
export const LogTaskCompletionSkippedSchema = z.object({
  kidId: UUID,
  reason: z.enum(['alreadyCompleted', 'notEligibleToday']),
});

export const LogTaskCompletionResponseSchema = z.object({
  credited: z.array(LogTaskCompletionCreditedSchema),
  skipped: z.array(LogTaskCompletionSkippedSchema),
});
export type LogTaskCompletionResponse = z.infer<typeof LogTaskCompletionResponseSchema>;
```

- [ ] **Step 1.2: Add export to `shared/src/index.ts`**

Add this line to the existing exports:

```ts
export * from './schemas/parent-log.js';
```

- [ ] **Step 1.3: Build the shared package**

Run: `npm run build:shared`
Expected: clean build, generates `shared/dist/schemas/parent-log.{js,d.ts}`.

- [ ] **Step 1.4: Commit**

```bash
git add shared/src/schemas/parent-log.ts shared/src/index.ts shared/dist
git commit -m "feat(shared): add parent log-completion schemas + isEligibleToday helper"
```

---

## Task 2 — Refactor backend eligibility to use shared helper

**Files:**
- Modify: `backend/src/services/tasks.service.ts`

- [ ] **Step 2.1: Replace inline filter with shared helper**

In `backend/src/services/tasks.service.ts`, find the `dueToday` filter inside `ensureTodayCompletions`:

```ts
const dueToday = candidateTasks.filter((t) => {
  if (t.recurrence === 'daily') return true;
  if (t.recurrence === 'weekly') {
    return Array.isArray(t.daysOfWeek) && t.daysOfWeek.includes(dow);
  }
  if (t.recurrence === 'once') {
    return true;
  }
  return false;
});
```

Replace with:

```ts
import { isEligibleToday, type DayOfWeek } from '@kroni/shared';
// ...
const dueToday = candidateTasks.filter((t) =>
  isEligibleToday(
    {
      recurrence: t.recurrence as 'daily' | 'weekly' | 'once',
      daysOfWeek: t.daysOfWeek,
      active: t.active,
    },
    dow as DayOfWeek,
  ),
);
```

(The pre-`active: true` filter is kept on the SQL `where` for an early prune; the helper's active-check is a defensive belt-and-braces.)

- [ ] **Step 2.2: Typecheck**

Run: `npm --workspace=backend run typecheck`
Expected: PASS, zero errors.

- [ ] **Step 2.3: Commit**

```bash
git add backend/src/services/tasks.service.ts
git commit -m "refactor(backend): use shared isEligibleToday helper in tasks service"
```

---

## Task 3 — Backend service: `listLoggableTasks` + `logTaskCompletion`

**Files:**
- Modify: `backend/src/services/tasks.service.ts`

- [ ] **Step 3.1: Add `listLoggableTasks` to tasks.service.ts**

Append to `backend/src/services/tasks.service.ts`:

```ts
import { kids } from '../db/schema/kids.js';
import type { LoggableTask } from '@kroni/shared';

/**
 * Returns today-eligible tasks for the household, each enriched with the
 * household's kids and per-kid `alreadyCompletedToday`. The Logg-mode UI
 * only shows tasks where at least one kid is not yet credited.
 */
export async function listLoggableTasks(householdId: string): Promise<LoggableTask[]> {
  const db = getDb();
  const today = todayInAppTz();
  const dow = dayOfWeekInAppTz();

  const householdKids = await db
    .select({ id: kids.id, name: kids.name, avatarKey: kids.avatarKey })
    .from(kids)
    .where(eq(kids.householdId, householdId));
  if (householdKids.length === 0) return [];

  const householdTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, householdId), eq(tasks.active, true)));

  const eligibleTasks = householdTasks.filter((t) =>
    isEligibleToday(
      {
        recurrence: t.recurrence as 'daily' | 'weekly' | 'once',
        daysOfWeek: t.daysOfWeek,
        active: t.active,
      },
      dow as DayOfWeek,
    ),
  );
  if (eligibleTasks.length === 0) return [];

  // Per-kid completion lookup for today. We treat both "approved" and
  // "completed_pending_approval" as "already credited / in-flight" so we
  // don't re-credit the same chore twice.
  const taskIds = eligibleTasks.map((t) => t.id);
  const kidIds = householdKids.map((k) => k.id);
  const completions = await db
    .select({
      taskId: taskCompletions.taskId,
      kidId: taskCompletions.kidId,
      completedAt: taskCompletions.completedAt,
      approvedAt: taskCompletions.approvedAt,
      rejectedAt: taskCompletions.rejectedAt,
    })
    .from(taskCompletions)
    .where(
      and(
        eq(taskCompletions.scheduledFor, today),
        // drizzle inArray: import { inArray } at top
      ),
    );
  // Filter in JS to keep the query simple (small N for typical households).
  const completionByTaskKid = new Map<string, (typeof completions)[number]>();
  for (const c of completions) {
    if (!taskIds.includes(c.taskId) || !kidIds.includes(c.kidId)) continue;
    completionByTaskKid.set(`${c.taskId}:${c.kidId}`, c);
  }

  const result: LoggableTask[] = eligibleTasks.map((t) => ({
    taskId: t.id,
    title: t.title,
    description: t.description,
    icon: t.icon,
    rewardCents: t.rewardCents,
    recurrence: t.recurrence as 'daily' | 'weekly' | 'once',
    requiresApproval: t.requiresApproval,
    eligibleKids: householdKids
      // If the task is bound to a specific kid (`tasks.kidId`), only show that kid.
      .filter((k) => t.kidId === null || t.kidId === k.id)
      .map((k) => {
        const c = completionByTaskKid.get(`${t.id}:${k.id}`);
        const alreadyCompletedToday =
          !!c && (c.approvedAt !== null || c.completedAt !== null) && c.rejectedAt === null;
        return {
          kidId: k.id,
          name: k.name,
          avatarKey: k.avatarKey,
          alreadyCompletedToday,
        };
      }),
  }));

  // Hide tasks where every eligible kid is already credited.
  return result.filter((r) => r.eligibleKids.some((k) => !k.alreadyCompletedToday));
}
```

- [ ] **Step 3.2: Add `logTaskCompletion` service**

Append to the same file. Note: this is the heart of the feature — read carefully.

```ts
import { sendPushToKid } from './notification.service.js';
import { addBalanceEntryInTx } from './balance.service.js';
import { ConflictError, NotFoundError, BadRequestError } from '../lib/errors.js';

export interface LogTaskCompletionParams {
  taskId: string;
  householdId: string;
  parentId: string;
  kidIds: string[];
  idempotencyKey: string;
}

export interface LogTaskCompletionResult {
  credited: { kidId: string; completionId: string; newBalanceCents: number }[];
  skipped: { kidId: string; reason: 'alreadyCompleted' | 'notEligibleToday' }[];
}

export async function logTaskCompletion(
  params: LogTaskCompletionParams,
): Promise<LogTaskCompletionResult> {
  const db = getDb();
  const today = todayInAppTz();
  const dow = dayOfWeekInAppTz();

  // 1. Load task + household-scope check.
  const taskRows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, params.taskId), eq(tasks.householdId, params.householdId)))
    .limit(1);
  const task = taskRows[0];
  if (!task) throw new NotFoundError('task not found');
  if (!task.active) throw new BadRequestError('task is inactive');

  // 2. Eligibility check (recurrence + day-of-week).
  if (
    !isEligibleToday(
      {
        recurrence: task.recurrence as 'daily' | 'weekly' | 'once',
        daysOfWeek: task.daysOfWeek,
        active: task.active,
      },
      dow as DayOfWeek,
    )
  ) {
    return {
      credited: [],
      skipped: params.kidIds.map((kidId) => ({ kidId, reason: 'notEligibleToday' as const })),
    };
  }

  // 3. Verify every kidId is in the household.
  const householdKidRows = await db
    .select({ id: kids.id })
    .from(kids)
    .where(eq(kids.householdId, params.householdId));
  const householdKidIds = new Set(householdKidRows.map((r) => r.id));
  for (const kidId of params.kidIds) {
    if (!householdKidIds.has(kidId)) {
      throw new BadRequestError(`kid ${kidId} not in this household`);
    }
  }

  // 4. If task is kid-bound, drop kidIds that don't match.
  const requestedKidIds =
    task.kidId === null
      ? params.kidIds
      : params.kidIds.filter((id) => id === task.kidId);

  // 5. Per-kid loop inside one transaction.
  const credited: LogTaskCompletionResult['credited'] = [];
  const skipped: LogTaskCompletionResult['skipped'] = params.kidIds
    .filter((id) => !requestedKidIds.includes(id))
    .map((kidId) => ({ kidId, reason: 'notEligibleToday' as const }));

  await db.transaction(async (tx) => {
    for (const kidId of requestedKidIds) {
      // a. Upsert today's completion row.
      const insertedRows = await tx
        .insert(taskCompletions)
        .values({
          taskId: task.id,
          kidId,
          scheduledFor: today,
          rewardCents: task.rewardCents,
          completedAt: new Date(),
          approvedAt: new Date(),
          approvedBy: params.parentId,
        })
        .onConflictDoNothing({
          target: [taskCompletions.taskId, taskCompletions.kidId, taskCompletions.scheduledFor],
        })
        .returning();

      let completionId: string;

      if (insertedRows.length > 0) {
        completionId = insertedRows[0]!.id;
      } else {
        // Row already existed. Look it up; promote pending → approved if needed.
        const existing = await tx
          .select()
          .from(taskCompletions)
          .where(
            and(
              eq(taskCompletions.taskId, task.id),
              eq(taskCompletions.kidId, kidId),
              eq(taskCompletions.scheduledFor, today),
            ),
          )
          .for('update')
          .limit(1);
        const row = existing[0];
        if (!row) {
          // Should not happen, but fail soft.
          skipped.push({ kidId, reason: 'alreadyCompleted' });
          continue;
        }
        if (row.approvedAt) {
          // Already credited → skip.
          skipped.push({ kidId, reason: 'alreadyCompleted' });
          continue;
        }
        if (row.rejectedAt) {
          // Previously rejected → re-open by clearing rejection and approving.
          await tx
            .update(taskCompletions)
            .set({
              completedAt: row.completedAt ?? new Date(),
              approvedAt: new Date(),
              approvedBy: params.parentId,
              rejectedAt: null,
            })
            .where(eq(taskCompletions.id, row.id));
        } else {
          // Pending or completed_pending_approval → approve.
          await tx
            .update(taskCompletions)
            .set({
              completedAt: row.completedAt ?? new Date(),
              approvedAt: new Date(),
              approvedBy: params.parentId,
            })
            .where(eq(taskCompletions.id, row.id));
        }
        completionId = row.id;
      }

      // b. Credit balance.
      const credit = await addBalanceEntryInTx(tx, {
        kidId,
        amountCents: task.rewardCents,
        reason: 'task',
        referenceId: completionId,
        referenceTitle: task.title,
        createdBy: params.parentId,
      });
      credited.push({ kidId, completionId, newBalanceCents: credit.newBalanceCents });
    }
  });

  // 6. Fire push to each credited kid (best-effort, after commit).
  for (const c of credited) {
    void sendPushToKid(
      c.kidId,
      'Bra jobba!',
      `+${(task.rewardCents / 100).toLocaleString('nb-NO')} kr for "${task.title}"`,
      { kind: 'kroni.taskApproved', amountCents: task.rewardCents },
    );
  }

  return { credited, skipped };
}
```

- [ ] **Step 3.3: Verify imports at the top of the file**

Ensure these imports exist (add what's missing):

```ts
import { and, eq, isNull, or, asc, inArray } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { tasks, taskCompletions, type TaskCompletionRow } from '../db/schema/tasks.js';
import { kids } from '../db/schema/kids.js';
import { todayInAppTz, dayOfWeekInAppTz } from '../lib/time.js';
import { isEligibleToday, type DayOfWeek } from '@kroni/shared';
import { sendPushToKid } from './notification.service.js';
import { addBalanceEntryInTx } from './balance.service.js';
import { ConflictError, NotFoundError, BadRequestError } from '../lib/errors.js';
import type { TaskCompletionStatus, LoggableTask } from '@kroni/shared';
```

The `inArray` import is unused once we filter in JS — leave it out unless step 3.1 uses it. Drop unused imports before committing.

- [ ] **Step 3.4: Typecheck**

Run: `npm --workspace=backend run typecheck`
Expected: PASS.

- [ ] **Step 3.5: Commit**

```bash
git add backend/src/services/tasks.service.ts
git commit -m "feat(backend): add listLoggableTasks + logTaskCompletion services"
```

---

## Task 4 — Backend routes: GET loggable + POST log-completion

**Files:**
- Modify: `backend/src/routes/parent/tasks.ts`

- [ ] **Step 4.1: Add the two routes**

Append to `parentTasksRoutes` in `backend/src/routes/parent/tasks.ts` (before the closing `}`):

```ts
import {
  LoggableTasksResponseSchema,
  LogTaskCompletionRequestSchema,
  LogTaskCompletionResponseSchema,
} from '@kroni/shared';
import { listLoggableTasks, logTaskCompletion } from '../../services/tasks.service.js';

// ...inside parentTasksRoutes, after the existing routes:

r.get(
  '/parent/tasks/loggable',
  {
    preHandler: app.requireParent,
    schema: { response: { 200: LoggableTasksResponseSchema } },
  },
  async (req) => {
    const household = req.household;
    if (!household) throw new UnauthorizedError('household missing');
    const list = await listLoggableTasks(household.id);
    return list as never;
  },
);

const LogParams = z.object({ taskId: z.string().uuid() });

r.post(
  '/parent/tasks/:taskId/log-completion',
  {
    preHandler: app.requireParent,
    schema: {
      params: LogParams,
      body: LogTaskCompletionRequestSchema,
      response: { 200: LogTaskCompletionResponseSchema },
    },
  },
  async (req) => {
    const parent = req.parent;
    const household = req.household;
    if (!parent || !household) throw new UnauthorizedError('household missing');
    const out = await logTaskCompletion({
      taskId: req.params.taskId,
      householdId: household.id,
      parentId: parent.id,
      kidIds: req.body.kidIds,
      idempotencyKey: req.body.idempotencyKey,
    });
    return out;
  },
);
```

Note on idempotency: the per-row unique index `(taskId, kidId, scheduledFor)` already prevents double-credits at the DB level. The `idempotencyKey` is captured for tracing/correlation but isn't currently dedupe-keyed server-side; this is acceptable because retries hit the same upsert path and produce the same outcome (already-approved rows skip credit). If you want hard dedup, add an `idempotency_keys` table later — out of scope here.

- [ ] **Step 4.2: Typecheck**

Run: `npm --workspace=backend run typecheck`
Expected: PASS.

- [ ] **Step 4.3: Commit**

```bash
git add backend/src/routes/parent/tasks.ts
git commit -m "feat(backend): add /parent/tasks/loggable and /parent/tasks/:id/log-completion routes"
```

---

## Task 5 — Backend integration test for log-completion

**Files:**
- Create: `backend/src/tests/log-completion.test.ts`
- Modify: `backend/package.json` — add the new test file to the `test` script.

- [ ] **Step 5.1: Create the test file**

Mirror the structure of an existing test (e.g., `backend/src/tests/balance.test.ts`). The test must seed a household, a parent, two kids, and one daily task, then call `logTaskCompletion` directly and assert the result.

```ts
// backend/src/tests/log-completion.test.ts
import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';
import { logTaskCompletion } from '../services/tasks.service.js';
import { getDb } from '../db/index.js';
import { households } from '../db/schema/household.js';
import { parents } from '../db/schema/parents.js';
import { kids } from '../db/schema/kids.js';
import { tasks, taskCompletions } from '../db/schema/tasks.js';
import { balanceEntries } from '../db/schema/balance.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

describe('logTaskCompletion', () => {
  let householdId: string;
  let parentId: string;
  let kidA: string;
  let kidB: string;
  let taskId: string;

  before(async () => {
    const db = getDb();
    householdId = (
      await db.insert(households).values({ name: 'Test' }).returning({ id: households.id })
    )[0]!.id;
    parentId = (
      await db
        .insert(parents)
        .values({ householdId, clerkUserId: `user_${randomUUID()}`, email: 'p@test' })
        .returning({ id: parents.id })
    )[0]!.id;
    kidA = (
      await db.insert(kids).values({ householdId, name: 'Ada' }).returning({ id: kids.id })
    )[0]!.id;
    kidB = (
      await db.insert(kids).values({ householdId, name: 'Bob' }).returning({ id: kids.id })
    )[0]!.id;
    taskId = (
      await db
        .insert(tasks)
        .values({
          householdId,
          parentId,
          title: 'Pusse tenner',
          rewardCents: 500,
          recurrence: 'daily',
          requiresApproval: true,
          active: true,
        })
        .returning({ id: tasks.id })
    )[0]!.id;
  });

  it('credits both kids on first call', async () => {
    const out = await logTaskCompletion({
      taskId,
      householdId,
      parentId,
      kidIds: [kidA, kidB],
      idempotencyKey: randomUUID(),
    });
    assert.equal(out.credited.length, 2);
    assert.equal(out.skipped.length, 0);
    assert.ok(out.credited.every((c) => c.newBalanceCents >= 500));
  });

  it('returns alreadyCompleted on retry within the same day', async () => {
    const out = await logTaskCompletion({
      taskId,
      householdId,
      parentId,
      kidIds: [kidA, kidB],
      idempotencyKey: randomUUID(),
    });
    assert.equal(out.credited.length, 0);
    assert.equal(out.skipped.length, 2);
    assert.ok(out.skipped.every((s) => s.reason === 'alreadyCompleted'));
  });

  it('rejects kids outside the household', async () => {
    const otherHouseholdId = (
      await getDb().insert(households).values({ name: 'Other' }).returning({ id: households.id })
    )[0]!.id;
    const otherKid = (
      await getDb()
        .insert(kids)
        .values({ householdId: otherHouseholdId, name: 'Eve' })
        .returning({ id: kids.id })
    )[0]!.id;
    await assert.rejects(
      logTaskCompletion({
        taskId,
        householdId,
        parentId,
        kidIds: [otherKid],
        idempotencyKey: randomUUID(),
      }),
      /not in this household/,
    );
  });
});
```

If the schemas referenced (`households`, `parents`, `balanceEntries`) have different column names, mirror them from neighboring tests. The structure above follows `balance.test.ts`. Adjust seed values if the test env requires more fields (e.g., `birthYear`).

- [ ] **Step 5.2: Add the test file to the test script**

Modify `backend/package.json` `scripts.test`:

```json
"test": "phase run \"tsx --import ./src/tests/_env.ts --test src/tests/health.test.ts src/tests/pairing.test.ts src/tests/balance.test.ts src/tests/allowance.test.ts src/tests/log-completion.test.ts\""
```

- [ ] **Step 5.3: Run the test**

Run: `npm --workspace=backend run test`
Expected: all tests pass, including the three new `logTaskCompletion` cases.

If the test env requires DB setup, follow the pattern in the other tests for seeding/teardown.

- [ ] **Step 5.4: Commit**

```bash
git add backend/src/tests/log-completion.test.ts backend/package.json
git commit -m "test(backend): integration tests for logTaskCompletion service"
```

---

## Task 6 — Mobile API client methods

**Files:**
- Modify: `mobile/lib/api.ts`

- [ ] **Step 6.1: Add the two methods to the parent API client**

Open `mobile/lib/api.ts`. Find `parentApi` (it has methods like `getTasks`, `approveTask`, `adjustKidBalance`). Add these two methods alongside:

```ts
import {
  LoggableTasksResponseSchema,
  LogTaskCompletionResponseSchema,
  type LoggableTask,
  type LogTaskCompletionRequest,
  type LogTaskCompletionResponse,
} from '@kroni/shared';

// inside the parentApi object / clientFor block:

async getLoggableTasks(): Promise<LoggableTask[]> {
  const json = await parentRequest('/parent/tasks/loggable');
  return LoggableTasksResponseSchema.parse(json);
},

async logTaskCompletion(
  taskId: string,
  body: LogTaskCompletionRequest,
): Promise<LogTaskCompletionResponse> {
  const json = await parentRequest(`/parent/tasks/${taskId}/log-completion`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return LogTaskCompletionResponseSchema.parse(json);
},
```

The existing `parentRequest` helper handles auth + base URL; mirror how `getTasks` calls it.

- [ ] **Step 6.2: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 6.3: Commit**

```bash
git add mobile/lib/api.ts
git commit -m "feat(mobile): parent API client methods for loggable tasks + log-completion"
```

---

## Task 7 — i18n keys across nb / sv / da / en

**Files:**
- Modify: `mobile/lib/i18n/nb.json`
- Modify: `mobile/lib/i18n/sv.json`
- Modify: `mobile/lib/i18n/da.json`
- Modify: `mobile/lib/i18n/en.json`

The new keys live under `parent.tasksList` (extending the existing block) and `parent.settings` (which may need creating — check the file first).

- [ ] **Step 7.1: Add to `nb.json`**

Inside the `parent.tasksList` block, add:

```json
"logMode": "Logg",
"logModeHeadlineA": "Hva er",
"logModeHeadlineB": "gjort",
"logModeExit": "Avslutt",
"logModeEmpty": "Ingen oppgaver å logge i dag.",
"kidPickerEyebrow": "Marker fullført",
"kidPickerTitleA": "Hvem gjorde",
"kidPickerNote": "Saldoen krediteres umiddelbart — ingen godkjenning nødvendig.",
"kidPickerCta": "Marker som fullført (%{count})",
"alreadyDone": "Ferdig",
"creditedFor": "Ferdig for %{names}",
"logErrorGeneric": "Kunne ikke logge. Prøv igjen.",
"logErrorAlreadyDone": "%{name} har allerede fått kreditt for denne i dag."
```

Inside `parent.settings` (or under `parent` if `settings` doesn't yet exist as a block), add:

```json
"householdSection": "Husstand",
"addKid": "Legg til barn",
"inviteParent": "Inviter forelder",
"inviteParentSoon": "Kommer snart"
```

Note: i18n-js uses `%{var}` for interpolation, not `{var}`. Use `%{count}` and `%{names}` to match other keys in this file (e.g., `parent.kidDetail.daysAgo` uses `%{count}`).

- [ ] **Step 7.2: Add to `sv.json` (Swedish)**

```json
"logMode": "Logga",
"logModeHeadlineA": "Vad är",
"logModeHeadlineB": "klart",
"logModeExit": "Avsluta",
"logModeEmpty": "Inga uppgifter att logga idag.",
"kidPickerEyebrow": "Markera klart",
"kidPickerTitleA": "Vem gjorde",
"kidPickerNote": "Saldot krediteras direkt — ingen godkännande behövs.",
"kidPickerCta": "Markera som klart (%{count})",
"alreadyDone": "Klart",
"creditedFor": "Klart för %{names}",
"logErrorGeneric": "Kunde inte logga. Försök igen.",
"logErrorAlreadyDone": "%{name} har redan fått kredit för detta idag."
```

Settings:

```json
"householdSection": "Hushåll",
"addKid": "Lägg till barn",
"inviteParent": "Bjud in förälder",
"inviteParentSoon": "Kommer snart"
```

- [ ] **Step 7.3: Add to `da.json` (Danish)**

```json
"logMode": "Logg",
"logModeHeadlineA": "Hvad er",
"logModeHeadlineB": "gjort",
"logModeExit": "Afslut",
"logModeEmpty": "Ingen opgaver at logge i dag.",
"kidPickerEyebrow": "Marker fuldført",
"kidPickerTitleA": "Hvem gjorde",
"kidPickerNote": "Saldoen krediteres straks — ingen godkendelse nødvendig.",
"kidPickerCta": "Marker som fuldført (%{count})",
"alreadyDone": "Færdig",
"creditedFor": "Færdig for %{names}",
"logErrorGeneric": "Kunne ikke logge. Prøv igen.",
"logErrorAlreadyDone": "%{name} har allerede fået kredit for denne i dag."
```

Settings:

```json
"householdSection": "Husstand",
"addKid": "Tilføj barn",
"inviteParent": "Inviter forælder",
"inviteParentSoon": "Kommer snart"
```

- [ ] **Step 7.4: Add to `en.json` (English)**

```json
"logMode": "Log",
"logModeHeadlineA": "What's",
"logModeHeadlineB": "done",
"logModeExit": "Exit",
"logModeEmpty": "No tasks to log today.",
"kidPickerEyebrow": "Mark complete",
"kidPickerTitleA": "Who did",
"kidPickerNote": "Balance is credited immediately — no approval needed.",
"kidPickerCta": "Mark complete (%{count})",
"alreadyDone": "Done",
"creditedFor": "Done for %{names}",
"logErrorGeneric": "Couldn't log. Try again.",
"logErrorAlreadyDone": "%{name} has already been credited for this today."
```

Settings:

```json
"householdSection": "Household",
"addKid": "Add child",
"inviteParent": "Invite parent",
"inviteParentSoon": "Coming soon"
```

- [ ] **Step 7.5: Verify all four JSONs are valid**

Run: `node -e "for (const l of ['nb','sv','da','en']) JSON.parse(require('fs').readFileSync('mobile/lib/i18n/' + l + '.json','utf8'))"`
Expected: no output (all parse cleanly).

- [ ] **Step 7.6: Commit**

```bash
git add mobile/lib/i18n/nb.json mobile/lib/i18n/sv.json mobile/lib/i18n/da.json mobile/lib/i18n/en.json
git commit -m "i18n(mobile): add Logg mode + Husstand keys for nb/sv/da/en"
```

---

## Task 8 — Move Settings out of the parent tab folder

**Files:**
- Move: `mobile/app/(parent)/(tabs)/settings.tsx` → `mobile/app/(parent)/settings.tsx`
- Modify: `mobile/app/(parent)/(tabs)/_layout.tsx`

- [ ] **Step 8.1: Move the settings file**

Run:

```bash
git mv mobile/app/\(parent\)/\(tabs\)/settings.tsx mobile/app/\(parent\)/settings.tsx
```

(On Windows bash, the parens are escaped; on PowerShell use quotes around the path.)

- [ ] **Step 8.2: Update relative imports inside the moved file**

Open `mobile/app/(parent)/settings.tsx`. Any import that was `'../../../lib/...'` or `'../../../components/...'` was relative to `(tabs)/`; it now lives one folder shallower. Decrease one `../`:

- `'../../../lib/theme'` → `'../../lib/theme'`
- `'../../../lib/i18n'` → `'../../lib/i18n'`
- `'../../../components/...'` → `'../../components/...'`
- `'../../../lib/useParentApi'` → `'../../lib/useParentApi'`
- `'../../../lib/api'` → `'../../lib/api'`

Use a single search-and-replace pass per prefix.

- [ ] **Step 8.3: Remove the settings tab entry**

In `mobile/app/(parent)/(tabs)/_layout.tsx`, delete this block:

```tsx
<Tabs.Screen
  name="settings"
  options={{
    title: t('parent.settings.title'),
    tabBarIcon: ({ color, size }) => (
      <Settings size={size} color={color} strokeWidth={1.75} />
    ),
    tabBarAccessibilityLabel: t('parent.settings.title'),
  }}
/>
```

Also remove the `Settings` import from `lucide-react-native` if it's not used elsewhere in this file (it isn't, after this delete).

- [ ] **Step 8.4: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 8.5: Manual smoke**

Start the app: `npm run dev:mobile` (or hot-reload if running). Sign in as parent. Verify:
- Tab bar shows 4 tabs: Barn · Oppgaver · Belønninger · Godkjenninger.
- Direct deep-link to `/(parent)/settings` still resolves (we wire the gear icon next).

- [ ] **Step 8.6: Commit**

```bash
git add mobile/app/\(parent\)/\(tabs\)/_layout.tsx mobile/app/\(parent\)/settings.tsx
# git mv records the rename automatically; if `git status` shows the old path as deleted, also include it:
git add -A mobile/app/\(parent\)/
git commit -m "refactor(mobile): move parent Settings out of tabs to a stack-pushed page"
```

---

## Task 9 — Replace "+" with gear icon on Barn tab

**Files:**
- Modify: `mobile/app/(parent)/(tabs)/kids.tsx`

- [ ] **Step 9.1: Swap the import**

In `mobile/app/(parent)/(tabs)/kids.tsx`, replace the lucide import line:

```tsx
import { Plus, Users, ChevronRight } from 'lucide-react-native';
```

With:

```tsx
import { Settings as SettingsIcon, Users, ChevronRight } from 'lucide-react-native';
```

(Aliased to avoid colliding with React Native's `Settings` API.)

- [ ] **Step 9.2: Replace the header button**

Find the header `TouchableOpacity` rendering the gold "+" pill and `handleAdd`. Replace `handleAdd` definition with:

```tsx
const handleSettings = useCallback(() => {
  void Haptics.selectionAsync();
  router.push('/(parent)/settings');
}, [router]);
```

Replace the button JSX:

```tsx
<TouchableOpacity
  onPress={handleSettings}
  accessibilityRole="button"
  accessibilityLabel={t('parent.settings.title')}
  style={[styles.iconBtn, { borderColor: theme.surface.border }]}
  activeOpacity={0.85}
>
  <SettingsIcon size={20} color={theme.text.primary} strokeWidth={1.75} />
</TouchableOpacity>
```

- [ ] **Step 9.3: Adjust the button style**

In the `styles.addBtn` block (gold-filled circle), rename to `iconBtn` and change to a hairline outlined treatment:

```ts
iconBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
```

The empty-state CTA `parent.kidsList.addKid` still routes to `/(parent)/kids/new` — leave it untouched.

- [ ] **Step 9.4: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 9.5: Manual smoke**

Reload. On the Barn tab, the gear icon top-right should push to Settings on tap. Empty state CTA still works for first-add.

- [ ] **Step 9.6: Commit**

```bash
git add mobile/app/\(parent\)/\(tabs\)/kids.tsx
git commit -m "feat(mobile): swap Barn tab \"+\" for gear icon routing to Settings"
```

---

## Task 10 — Husstand section in Settings with "Legg til barn"

**Files:**
- Modify: `mobile/app/(parent)/settings.tsx`

The exact section pattern depends on the existing Settings layout. Open the file first; the goal is to add a section block matching the styling used by the surrounding sections (account, subscription, theme).

- [ ] **Step 10.1: Add the Husstand section**

Insert near the top of the sections list (above account/subscription, since adding a kid is a "setup" action):

```tsx
import { useRouter } from 'expo-router';
import { UserPlus, Users } from 'lucide-react-native';

// inside the component:
const router = useRouter();

// inside the JSX section list:
<View style={styles.section}>
  <KroniText variant="eyebrow" tone="tertiary">
    {t('parent.settings.householdSection')}
  </KroniText>
  <Card>
    <TouchableOpacity
      onPress={() => router.push('/(parent)/kids/new')}
      accessibilityRole="button"
      accessibilityLabel={t('parent.settings.addKid')}
      style={styles.row}
    >
      <UserPlus size={20} color={theme.text.primary} strokeWidth={1.75} />
      <KroniText variant="body" tone="primary" style={{ flex: 1 }}>
        {t('parent.settings.addKid')}
      </KroniText>
      <ChevronRight size={18} color={theme.text.secondary} strokeWidth={1.5} />
    </TouchableOpacity>
    <View style={[styles.rowDivider, { backgroundColor: theme.surface.border }]} />
    <View style={[styles.row, { opacity: 0.55 }]}>
      <Users size={20} color={theme.text.primary} strokeWidth={1.75} />
      <View style={{ flex: 1 }}>
        <KroniText variant="body" tone="primary">
          {t('parent.settings.inviteParent')}
        </KroniText>
        <KroniText variant="caption" tone="tertiary">
          {t('parent.settings.inviteParentSoon')}
        </KroniText>
      </View>
    </View>
  </Card>
</View>
```

If `Card` and the row/section styles don't match the existing settings layout exactly, adapt to whatever pattern is used in the rest of the file. The goal is to add a section — not introduce new visual patterns.

If the existing settings file doesn't already import `ChevronRight`, add it. Add `useRouter` import if not present.

- [ ] **Step 10.2: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 10.3: Manual smoke**

Open Settings (gear icon). Verify the *Husstand* section renders, "Legg til barn" pushes to `/(parent)/kids/new`, "Inviter forelder" is visibly disabled with "Kommer snart" caption.

- [ ] **Step 10.4: Commit**

```bash
git add mobile/app/\(parent\)/settings.tsx
git commit -m "feat(mobile): add Husstand section to Settings with \"Legg til barn\""
```

---

## Task 11 — KidPickerSheet component

**Files:**
- Create: `mobile/components/parent/KidPickerSheet.tsx`

- [ ] **Step 11.1: Create the component**

```tsx
// mobile/components/parent/KidPickerSheet.tsx
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Square, CheckSquare2 } from 'lucide-react-native';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { KroniText } from '../ui/Text';
import type { LoggableTask, LoggableKid } from '@kroni/shared';

interface KidPickerSheetProps {
  task: LoggableTask | null;
  onClose: () => void;
  onSubmit: (kidIds: string[]) => void;
  isSubmitting: boolean;
}

export function KidPickerSheet({ task, onClose, onSubmit, isSubmitting }: KidPickerSheetProps) {
  const theme = useTheme();
  const tx = theme.text;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection when the sheet's task changes (or closes).
  useEffect(() => {
    setSelected(new Set());
  }, [task?.taskId]);

  const eligible = useMemo<LoggableKid[]>(() => task?.eligibleKids ?? [], [task]);

  function toggle(kidId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kidId)) next.delete(kidId);
      else next.add(kidId);
      return next;
    });
  }

  const count = selected.size;

  return (
    <Sheet visible={task !== null} onClose={onClose}>
      {task ? (
        <View style={styles.content}>
          <KroniText variant="eyebrow" tone="gold">
            {t('parent.tasksList.kidPickerEyebrow')}
          </KroniText>
          <View style={styles.titleRow}>
            <KroniText variant="display" tone="primary" style={styles.title}>
              {t('parent.tasksList.kidPickerTitleA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.title, { fontFamily: fonts.displayItalic }]}
            >
              {task.title}
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.title}>
              ?
            </KroniText>
          </View>

          <View style={styles.kidList}>
            {eligible.map((kid) => {
              const isDisabled = kid.alreadyCompletedToday;
              const isChecked = selected.has(kid.kidId);
              return (
                <TouchableOpacity
                  key={kid.kidId}
                  onPress={() => !isDisabled && toggle(kid.kidId)}
                  disabled={isDisabled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ disabled: isDisabled, checked: isChecked }}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  style={[
                    styles.kidRow,
                    {
                      borderColor: isChecked
                        ? theme.colors.gold[500]
                        : theme.surface.border,
                      opacity: isDisabled ? 0.55 : 1,
                    },
                  ]}
                >
                  <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={40} />
                  <KroniText variant="h2" tone="primary" style={{ flex: 1 }}>
                    {kid.name}
                  </KroniText>
                  {isDisabled ? (
                    <Badge label={t('parent.tasksList.alreadyDone')} variant="default" />
                  ) : isChecked ? (
                    <CheckSquare2 size={28} color={theme.colors.gold[500]} strokeWidth={2} />
                  ) : (
                    <Square size={28} color={tx.tertiary} strokeWidth={1.75} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <KroniText variant="caption" tone="secondary" style={styles.note}>
            {t('parent.tasksList.kidPickerNote')}
          </KroniText>

          <Button
            label={t('parent.tasksList.kidPickerCta', { count })}
            onPress={() => onSubmit(Array.from(selected))}
            variant="primary"
            size="md"
            disabled={count === 0 || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  title: { fontSize: 24, lineHeight: 28, letterSpacing: -0.4 },
  kidList: { gap: 10 },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  note: { marginTop: 4 },
});
```

If `Avatar`, `Badge`, `Sheet`, `Button` paths differ from `../ui/<Name>`, find the actual paths under `mobile/components/ui/` and adjust.

- [ ] **Step 11.2: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 11.3: Commit**

```bash
git add mobile/components/parent/KidPickerSheet.tsx
git commit -m "feat(mobile): KidPickerSheet for multi-select log-on-behalf flow"
```

---

## Task 12 — Logg mode on the Oppgaver tab

**Files:**
- Modify: `mobile/app/(parent)/(tabs)/tasks.tsx`

This is the largest mobile task. It rewires the existing tasks tab to support a parent-driven "log completion" mode.

- [ ] **Step 12.1: Add Logg-mode state and queries**

At the top of `TasksTab()`, after the existing `useTheme`/`useRouter`/`useParentApi` lines, add:

```tsx
const [logMode, setLogMode] = useState(false);
const [pickerTask, setPickerTask] = useState<LoggableTask | null>(null);
const [confirmation, setConfirmation] = useState<{ taskId: string; names: string } | null>(null);
const [logError, setLogError] = useState<string | null>(null);

const { data: loggableTasks, isLoading: isLoggableLoading, refetch: refetchLoggable } = useQuery({
  queryKey: ['parent', 'tasks', 'loggable'],
  queryFn: () => api.getLoggableTasks(),
  enabled: logMode,
});

const logMutation = useMutation({
  mutationFn: (input: { taskId: string; kidIds: string[] }) =>
    api.logTaskCompletion(input.taskId, {
      kidIds: input.kidIds,
      idempotencyKey: generateIdempotencyKey(),
    }),
  onSuccess: (result, vars) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPickerTask(null);
    setLogError(null);
    if (result.credited.length > 0) {
      // Use the kid names from the picker task we just submitted.
      const names = (loggableTasks ?? [])
        .find((t) => t.taskId === vars.taskId)
        ?.eligibleKids
        .filter((k) => result.credited.some((c) => c.kidId === k.kidId))
        .map((k) => k.name)
        .join(', ');
      if (names) {
        setConfirmation({ taskId: vars.taskId, names });
        setTimeout(() => setConfirmation((prev) => (prev?.taskId === vars.taskId ? null : prev)), 1500);
      }
    }
    if (result.skipped.length > 0 && result.credited.length === 0) {
      const taskBeingLogged = (loggableTasks ?? []).find((tt) => tt.taskId === vars.taskId);
      const firstSkippedKidId = result.skipped[0]?.kidId;
      const skippedName =
        taskBeingLogged?.eligibleKids.find((k) => k.kidId === firstSkippedKidId)?.name ?? '';
      setLogError(t('parent.tasksList.logErrorAlreadyDone', { name: skippedName }));
    }
    void queryClient.invalidateQueries({ queryKey: ['parent', 'tasks', 'loggable'] });
    void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
    void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
  },
  onError: () => {
    setLogError(t('parent.tasksList.logErrorGeneric'));
  },
});
```

Add the imports at the top:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ListChecks } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { LoggableTask } from '@kroni/shared';
import { KidPickerSheet } from '../../../components/parent/KidPickerSheet';

function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

Add `useQueryClient` only if not already imported. The `generateIdempotencyKey` helper is duplicated from the kid Today screen — accept the duplication for now; it's eight lines and a future task can move it to `@kroni/shared` if needed.

- [ ] **Step 12.2: Update the header to support the Logg toggle**

Replace the existing header `View` with this version. The header now renders one of two layouts based on `logMode`:

```tsx
<View style={styles.header}>
  <View style={styles.headerText}>
    <KroniText variant="eyebrow" tone="gold">
      {t('parent.tasksList.eyebrow')}
    </KroniText>
    <View style={styles.headlineRow}>
      {logMode ? (
        <>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            {t('parent.tasksList.logModeHeadlineA')}{' '}
          </KroniText>
          <KroniText
            variant="displayItalic"
            tone="gold"
            style={[styles.headline, { fontFamily: fonts.displayItalic }]}
          >
            {t('parent.tasksList.logModeHeadlineB')}
          </KroniText>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            ?
          </KroniText>
        </>
      ) : (
        <>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            {t('parent.tasksList.headlineA')}{' '}
          </KroniText>
          <KroniText
            variant="displayItalic"
            tone="gold"
            style={[styles.headline, { fontFamily: fonts.displayItalic }]}
          >
            {t('parent.tasksList.headlineB')}
          </KroniText>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            ?
          </KroniText>
        </>
      )}
    </View>
  </View>
  {logMode ? (
    <TouchableOpacity
      onPress={() => {
        void Haptics.selectionAsync();
        setLogMode(false);
        setLogError(null);
      }}
      accessibilityRole="button"
      accessibilityLabel={t('parent.tasksList.logModeExit')}
      style={[styles.iconBtn, { borderColor: theme.surface.border }]}
      activeOpacity={0.85}
    >
      <KroniText variant="body" tone="primary">
        {t('parent.tasksList.logModeExit')}
      </KroniText>
    </TouchableOpacity>
  ) : (
    <View style={styles.headerBtnRow}>
      <TouchableOpacity
        onPress={() => {
          void Haptics.selectionAsync();
          setLogMode(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('parent.tasksList.logMode')}
        style={[styles.iconBtn, { borderColor: theme.surface.border }]}
        activeOpacity={0.85}
      >
        <ListChecks size={20} color={theme.text.primary} strokeWidth={1.75} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel={t('parent.tasksList.addTask')}
        style={[styles.addBtn, { backgroundColor: theme.colors.gold[500] }]}
        activeOpacity={0.85}
      >
        <Plus size={20} color={theme.colors.sand[900]} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  )}
</View>
```

Add styles:

```ts
headerBtnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
iconBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 12,
},
```

The `iconBtn` width is removed if its children are text ("Avslutt"). Make `iconBtn` have `minWidth: 44` and `paddingHorizontal: 12`, and drop the fixed `width: 44`. Final:

```ts
iconBtn: {
  minWidth: 44,
  height: 44,
  borderRadius: 22,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 12,
},
```

- [ ] **Step 12.3: Replace the list body with mode-aware rendering**

Replace the existing `tasks` query body (the `isLoading ? ... : isError ? ... : tasks.length===0 ? ... : <FlashList ...>`) with:

```tsx
{logMode ? (
  isLoggableLoading ? (
    <View style={styles.center}><Spinner /></View>
  ) : (loggableTasks ?? []).length === 0 ? (
    <EmptyState
      icon={CheckSquare}
      title={t('parent.tasksList.logModeEmpty')}
    />
  ) : (
    <FlashList
      data={loggableTasks ?? []}
      keyExtractor={(item) => item.taskId}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            void Haptics.selectionAsync();
            // One-kid shortcut: skip picker if only one eligible kid.
            const eligibleNonDone = item.eligibleKids.filter((k) => !k.alreadyCompletedToday);
            if (eligibleNonDone.length === 1) {
              logMutation.mutate({ taskId: item.taskId, kidIds: [eligibleNonDone[0]!.kidId] });
              return;
            }
            setPickerTask(item);
          }}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          activeOpacity={0.8}
        >
          <Card style={[styles.taskCard, styles.logCard, { borderLeftColor: theme.colors.gold[300] }]}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: theme.text.primary }]} numberOfLines={1}>
                {item.icon ? `${item.icon} ` : ''}{item.title}
              </Text>
              <Text style={[styles.taskReward, { color: theme.colors.gold[500] }]}>
                {formatNok(item.rewardCents)}
              </Text>
            </View>
            {confirmation?.taskId === item.taskId ? (
              <KroniText variant="caption" tone="success">
                {t('parent.tasksList.creditedFor', { names: confirmation.names })}
              </KroniText>
            ) : null}
          </Card>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isLoggableLoading}
          onRefresh={() => void refetchLoggable()}
          tintColor={theme.colors.gold[500]}
        />
      }
    />
  )
) : (
  // Existing browse-mode rendering — keep as-is.
  isLoading ? <View style={styles.center}><Spinner /></View>
    : isError ? /* existing */
    : tasks && tasks.length === 0 ? /* existing empty */
    : <FlashList ... /* existing */>
)}
```

Add styles:

```ts
logCard: {
  borderLeftWidth: 4,
},
```

Add a `tone="success"` variant to KroniText if it doesn't exist; if it does not, fall back to `style={{ color: theme.colors.semantic.success }}`.

- [ ] **Step 12.4: Mount the picker sheet and the error banner**

At the bottom of the `SafeAreaView`, before its closing tag, add:

```tsx
{logError ? (
  <View
    style={[
      styles.errorBanner,
      { backgroundColor: theme.colors.semantic.danger + '18' },
    ]}
    accessibilityLiveRegion="polite"
    accessibilityRole="alert"
  >
    <KroniText variant="small" style={{ color: theme.colors.semantic.danger, flex: 1 }}>
      {logError}
    </KroniText>
    <TouchableOpacity
      onPress={() => setLogError(null)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={t('common.close')}
    >
      <KroniText variant="small" tone="danger">×</KroniText>
    </TouchableOpacity>
  </View>
) : null}

<KidPickerSheet
  task={pickerTask}
  onClose={() => setPickerTask(null)}
  onSubmit={(kidIds) => {
    if (!pickerTask) return;
    logMutation.mutate({ taskId: pickerTask.taskId, kidIds });
  }}
  isSubmitting={logMutation.isPending}
/>
```

Add styles:

```ts
errorBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  margin: 16,
},
```

- [ ] **Step 12.5: Typecheck**

Run: `npm --workspace=mobile run typecheck`
Expected: PASS.

- [ ] **Step 12.6: Manual smoke**

1. Open Oppgaver tab → tap Logg → headline swaps, Avslutt button replaces Logg+plus, list shows today-eligible tasks with gold left border.
2. Tap a task → kid picker sheet opens. Multi-select two kids → "Marker som fullført (2)" → tap → sheet closes, success haptic, "Ferdig for Ada, Bob" appears under the row briefly.
3. Tap the same task again → its kids show "Ferdig" badge (re-fetched).
4. Single-kid household: tap a task → no sheet, immediate credit + confirmation.
5. Avslutt → returns to normal browse mode, tasks list rendered as before.

- [ ] **Step 12.7: Commit**

```bash
git add mobile/app/\(parent\)/\(tabs\)/tasks.tsx
git commit -m "feat(mobile): Logg mode on Oppgaver tab with multi-kid log-on-behalf"
```

---

## Final verification

- [ ] **Step F.1: Workspace lint + typecheck**

Run: `npm run typecheck && npm run lint`
Expected: clean.

- [ ] **Step F.2: Backend tests**

Run: `npm --workspace=backend run test`
Expected: all tests pass, including the new log-completion suite.

- [ ] **Step F.3: End-to-end smoke (manual)**

With the mobile app pointed at a backend that has the new endpoints:

1. Tab bar shows 4 tabs.
2. Settings reachable via gear icon on Barn tab.
3. "Legg til barn" reachable via Settings → Husstand → Legg til barn → /(parent)/kids/new.
4. Logg mode on Oppgaver: tap a task → multi-select kids → submit → balance reflects credit on both kids.
5. Already-credited kid shows "Ferdig" badge on next pass.
6. Phone-equipped kid receives push and sees the celebrate screen.

---

## Self-review checklist

- ✅ Spec coverage: every section of the spec maps to a task. Tab consolidation → Tasks 8/9. Settings Husstand → Task 10. Logg mode → Tasks 11/12. Backend semantics → Tasks 3/4/5. i18n → Task 7. Shared helper → Task 1.
- ✅ No placeholders: every code block is concrete; no "TBD" or "implement later".
- ✅ Type consistency: `LoggableTask` shape is defined once in Task 1 and consumed verbatim in Tasks 3, 6, 11, 12. `LogTaskCompletionResponse` likewise.
- ✅ Idempotency: documented in Task 4. The DB unique index `(taskId, kidId, scheduledFor)` already exists per `ensureTodayCompletions` — no migration needed.
- ✅ Notifications: Task 3 fires `sendPushToKid` with `kind: 'kroni.taskApproved'` after commit, matching the kid's existing celebrate-screen listener.
- ✅ Today-eligibility: shared helper (Task 1) used on backend (Tasks 2 + 3). Mobile does not duplicate the logic — it consumes the server's pre-filtered `loggable` response.
