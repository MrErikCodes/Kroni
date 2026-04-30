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
