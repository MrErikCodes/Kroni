import { and, eq, isNull, or, asc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { tasks, taskCompletions, type TaskCompletionRow } from '../db/schema/tasks.js';
import { todayInAppTz, dayOfWeekInAppTz } from '../lib/time.js';
import type { TaskCompletionStatus } from '@kroni/shared';

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

  const dueToday = candidateTasks.filter((t) => {
    if (t.recurrence === 'daily') return true;
    if (t.recurrence === 'weekly') {
      return Array.isArray(t.daysOfWeek) && t.daysOfWeek.includes(dow);
    }
    if (t.recurrence === 'once') {
      // 'once' tasks render until completed, then never again.
      return true;
    }
    return false;
  });

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
