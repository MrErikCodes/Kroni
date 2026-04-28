import { z } from 'zod';
import { UUID, IsoTimestamp, IsoDate, Cents } from './common.js';

export const RecurrenceSchema = z.enum(['daily', 'weekly', 'once']);
export type Recurrence = z.infer<typeof RecurrenceSchema>;

export const DaysOfWeekSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1)
  .max(7)
  .refine((arr) => new Set(arr).size === arr.length, 'days must be unique');

export const TaskSchema = z.object({
  id: UUID,
  // Creator parent (audit). Nullable post-creator-deletion. Household
  // ownership is authoritative.
  parentId: UUID.nullable(),
  kidId: UUID.nullable(),
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable(),
  icon: z.string().max(40).nullable(),
  rewardCents: Cents,
  recurrence: RecurrenceSchema,
  daysOfWeek: z.array(z.number().int().min(0).max(6)).nullable(),
  requiresApproval: z.boolean(),
  active: z.boolean(),
  createdAt: IsoTimestamp,
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  kidId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().max(40).optional(),
  rewardCents: z.number().int().min(0).max(1_000_000),
  recurrence: RecurrenceSchema,
  daysOfWeek: DaysOfWeekSchema.optional(),
  requiresApproval: z.boolean().default(true),
  active: z.boolean().default(true),
}).refine(
  (t) => t.recurrence !== 'weekly' || (t.daysOfWeek && t.daysOfWeek.length > 0),
  { message: 'weekly recurrence requires daysOfWeek', path: ['daysOfWeek'] },
);
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  kidId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  rewardCents: z.number().int().min(0).max(1_000_000).optional(),
  recurrence: RecurrenceSchema.optional(),
  daysOfWeek: DaysOfWeekSchema.nullable().optional(),
  requiresApproval: z.boolean().optional(),
  active: z.boolean().optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const TaskCompletionStatus = z.enum([
  'pending',
  'completed_pending_approval',
  'approved',
  'rejected',
]);
export type TaskCompletionStatus = z.infer<typeof TaskCompletionStatus>;

export const TaskCompletionSchema = z.object({
  id: UUID,
  taskId: UUID,
  kidId: UUID,
  scheduledFor: IsoDate,
  completedAt: IsoTimestamp.nullable(),
  approvedAt: IsoTimestamp.nullable(),
  approvedBy: UUID.nullable(),
  rejectedAt: IsoTimestamp.nullable(),
  rewardCents: Cents,
  createdAt: IsoTimestamp,
});
export type TaskCompletion = z.infer<typeof TaskCompletionSchema>;

// What the kid sees on /today — joined task + computed status. Includes
// recurrence + daysOfWeek so the kid's task-detail sheet can render the
// schedule ("Hver mandag og onsdag") without a second round-trip.
export const TodayTaskSchema = z.object({
  completionId: UUID,
  taskId: UUID,
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  rewardCents: Cents,
  requiresApproval: z.boolean(),
  recurrence: RecurrenceSchema,
  daysOfWeek: z.array(z.number().int().min(0).max(6)).nullable(),
  status: TaskCompletionStatus,
  completedAt: IsoTimestamp.nullable(),
});
export type TodayTask = z.infer<typeof TodayTaskSchema>;
