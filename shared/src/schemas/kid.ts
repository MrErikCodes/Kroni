import { z } from 'zod';
import { UUID, IsoTimestamp, Cents, AvatarKey } from './common.js';

const currentYear = new Date().getUTCFullYear();
const minBirthYear = currentYear - 25;
const maxBirthYear = currentYear;

// Allowance frequency. dayOfWeek convention matches lib/time.ts /
// JS Date.getDay: 0 = Sunday … 6 = Saturday.
export const AllowanceFrequency = z.enum(['none', 'weekly', 'biweekly', 'monthly']);
export type AllowanceFrequency = z.infer<typeof AllowanceFrequency>;

const dayOfWeekSchema = z.number().int().min(0).max(6).nullable();
const dayOfMonthSchema = z.number().int().min(1).max(31).nullable();

export const KidSchema = z.object({
  id: UUID,
  // Creator parent id at pair / create time. Nullable because the kid
  // survives deletion of the creator parent — household ownership is
  // authoritative now.
  parentId: UUID.nullable(),
  name: z.string().min(1).max(40),
  birthYear: z.number().int().min(minBirthYear).max(maxBirthYear).nullable(),
  avatarKey: AvatarKey.nullable(),
  allowanceFrequency: AllowanceFrequency,
  allowanceCents: Cents,
  allowanceDayOfWeek: dayOfWeekSchema,
  allowanceDayOfMonth: dayOfMonthSchema,
  allowanceLastPaidAt: IsoTimestamp.nullable(),
  createdAt: IsoTimestamp,
});
export type Kid = z.infer<typeof KidSchema>;

// Per-frequency required-day refinement. Centralised so create + update
// share the same rule. `data` is partial-shaped because UpdateKidSchema
// pipes a partial in.
function refineFrequencyDays<T extends {
  allowanceFrequency?: AllowanceFrequency | undefined;
  allowanceDayOfWeek?: number | null | undefined;
  allowanceDayOfMonth?: number | null | undefined;
  allowanceCents?: number | undefined;
}>(data: T, ctx: z.RefinementCtx): void {
  const freq = data.allowanceFrequency;
  if (freq === undefined) return;
  if (freq === 'weekly' || freq === 'biweekly') {
    if (data.allowanceDayOfWeek === undefined || data.allowanceDayOfWeek === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfWeek'],
        message: 'allowanceDayOfWeek is required for weekly/biweekly',
      });
    }
    if (data.allowanceDayOfMonth !== undefined && data.allowanceDayOfMonth !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfMonth'],
        message: 'allowanceDayOfMonth must be null for weekly/biweekly',
      });
    }
  } else if (freq === 'monthly') {
    if (data.allowanceDayOfMonth === undefined || data.allowanceDayOfMonth === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfMonth'],
        message: 'allowanceDayOfMonth is required for monthly',
      });
    }
    if (data.allowanceDayOfWeek !== undefined && data.allowanceDayOfWeek !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfWeek'],
        message: 'allowanceDayOfWeek must be null for monthly',
      });
    }
  } else if (freq === 'none') {
    if (data.allowanceDayOfWeek !== undefined && data.allowanceDayOfWeek !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfWeek'],
        message: 'allowanceDayOfWeek must be null when frequency is none',
      });
    }
    if (data.allowanceDayOfMonth !== undefined && data.allowanceDayOfMonth !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowanceDayOfMonth'],
        message: 'allowanceDayOfMonth must be null when frequency is none',
      });
    }
    // We intentionally allow allowanceCents to remain non-zero when frequency
    // is 'none'. The amount is preserved as a saved preference so the parent
    // can re-enable a schedule without re-entering the kr value. The cron
    // job filters on frequency, so 'none' kids never get paid.
  }
}

const baseCreateKidSchema = z.object({
  name: z.string().min(1).max(40),
  birthYear: z.number().int().min(minBirthYear).max(maxBirthYear).optional(),
  avatarKey: AvatarKey.optional(),
  pin: z.string().regex(/^\d{4}$/, 'pin must be 4 digits').optional(),
  allowanceFrequency: AllowanceFrequency.default('none'),
  allowanceCents: z.number().int().min(0).default(0),
  allowanceDayOfWeek: dayOfWeekSchema.optional(),
  allowanceDayOfMonth: dayOfMonthSchema.optional(),
  // [DEPRECATED weeklyAllowanceCents] write-only alias kept for one release:
  // when present and the new fields are not, it implies frequency=weekly,
  // dayOfWeek=1 (Monday). Resolved in the route handler. Will be removed in
  // a future release.
  weeklyAllowanceCents: z.number().int().min(0).optional(),
});

export const CreateKidSchema = baseCreateKidSchema.superRefine(refineFrequencyDays);
export type CreateKidInput = z.infer<typeof CreateKidSchema>;

export const UpdateKidSchema = baseCreateKidSchema.partial().superRefine(refineFrequencyDays);
export type UpdateKidInput = z.infer<typeof UpdateKidSchema>;
