import { and, eq, isNull, or, asc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { tasks, taskCompletions, type TaskCompletionRow } from '../db/schema/tasks.js';
import { kids } from '../db/schema/kids.js';
import { todayInAppTz, dayOfWeekInAppTz } from '../lib/time.js';
import {
  isEligibleToday,
  LoggableTasksResponseSchema,
  type DayOfWeek,
  type TaskCompletionStatus,
  type LoggableTask,
} from '@kroni/shared';
import { sendPushToKid } from './notification.service.js';
import { addBalanceEntryInTx } from './balance.service.js';
import { NotFoundError, BadRequestError } from '../lib/errors.js';

// Idempotently create today's task_completions for the kid. Safe to call repeatedly:
// the unique index on (taskId, kidId, scheduledFor) blocks duplicates and we ignore
// the conflicts. Returns rows present after the call.
export async function ensureTodayCompletions(kidId: string, householdId: string): Promise<void> {
  const db = getDb();
  const today = todayInAppTz();
  const dow = dayOfWeekInAppTz();

  // Find active tasks targeting this kid (or unassigned for the household).
  const candidateTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.householdId, householdId),
        eq(tasks.active, true),
        or(eq(tasks.kidId, kidId), isNull(tasks.kidId)),
      ),
    );

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

  if (dueToday.length === 0) return;

  await db
    .insert(taskCompletions)
    .values(
      dueToday.map((t) => ({
        taskId: t.id,
        kidId,
        scheduledFor: today,
        rewardCents: t.rewardCents,
      })),
    )
    .onConflictDoNothing({
      target: [taskCompletions.taskId, taskCompletions.kidId, taskCompletions.scheduledFor],
    });
}

export interface TodayTaskShape {
  completionId: string;
  taskId: string;
  title: string;
  description: string | null;
  icon: string | null;
  rewardCents: number;
  requiresApproval: boolean;
  recurrence: 'daily' | 'weekly' | 'once';
  daysOfWeek: number[] | null;
  status: TaskCompletionStatus;
  completedAt: string | null;
}

export function deriveStatus(c: TaskCompletionRow): TaskCompletionStatus {
  if (c.approvedAt) return 'approved';
  if (c.rejectedAt) return 'rejected';
  if (c.completedAt) return 'completed_pending_approval';
  return 'pending';
}

export async function listTodayTasks(kidId: string): Promise<TodayTaskShape[]> {
  const db = getDb();
  const today = todayInAppTz();
  const rows = await db
    .select({
      completionId: taskCompletions.id,
      taskId: tasks.id,
      title: tasks.title,
      description: tasks.description,
      icon: tasks.icon,
      rewardCents: tasks.rewardCents,
      requiresApproval: tasks.requiresApproval,
      recurrence: tasks.recurrence,
      daysOfWeek: tasks.daysOfWeek,
      completion: taskCompletions,
    })
    .from(taskCompletions)
    .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
    .where(and(eq(taskCompletions.kidId, kidId), eq(taskCompletions.scheduledFor, today)))
    .orderBy(asc(tasks.title));
  return rows.map((r) => ({
    completionId: r.completionId,
    taskId: r.taskId,
    title: r.title,
    description: r.description,
    icon: r.icon,
    rewardCents: r.rewardCents,
    requiresApproval: r.requiresApproval,
    recurrence: r.recurrence as TodayTaskShape['recurrence'],
    daysOfWeek: r.daysOfWeek,
    status: deriveStatus(r.completion),
    completedAt: r.completion.completedAt ? r.completion.completedAt.toISOString() : null,
  }));
}

void sql; // suppress unused-import in some toolchains

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
    .where(eq(taskCompletions.scheduledFor, today));

  const completionByTaskKid = new Map<string, (typeof completions)[number]>();
  for (const c of completions) {
    if (!taskIds.includes(c.taskId) || !kidIds.includes(c.kidId)) continue;
    completionByTaskKid.set(`${c.taskId}:${c.kidId}`, c);
  }

  const raw = eligibleTasks.map((t) => ({
    taskId: t.id,
    title: t.title,
    description: t.description,
    icon: t.icon,
    rewardCents: t.rewardCents,
    recurrence: t.recurrence as 'daily' | 'weekly' | 'once',
    requiresApproval: t.requiresApproval,
    eligibleKids: householdKids
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

  const result: LoggableTask[] = LoggableTasksResponseSchema.parse(raw);
  return result.filter((r) => r.eligibleKids.some((k) => !k.alreadyCompletedToday));
}

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

  const taskRows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, params.taskId), eq(tasks.householdId, params.householdId)))
    .limit(1);
  const task = taskRows[0];
  if (!task) throw new NotFoundError('task not found');
  if (!task.active) throw new BadRequestError('task is inactive');

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

  const requestedKidIds =
    task.kidId === null
      ? params.kidIds
      : params.kidIds.filter((id) => id === task.kidId);

  const credited: LogTaskCompletionResult['credited'] = [];
  const skipped: LogTaskCompletionResult['skipped'] = params.kidIds
    .filter((id) => !requestedKidIds.includes(id))
    .map((kidId) => ({ kidId, reason: 'notEligibleToday' as const }));

  await db.transaction(async (tx) => {
    for (const kidId of requestedKidIds) {
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
          skipped.push({ kidId, reason: 'alreadyCompleted' });
          continue;
        }
        if (row.approvedAt) {
          skipped.push({ kidId, reason: 'alreadyCompleted' });
          continue;
        }
        if (row.rejectedAt) {
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
