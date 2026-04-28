import { z } from 'zod';
import { UUID, IsoTimestamp, Cents, AvatarKey } from './common.js';

const currentYear = new Date().getUTCFullYear();
const minBirthYear = currentYear - 25;
const maxBirthYear = currentYear;

export const KidSchema = z.object({
  id: UUID,
  // Creator parent id at pair / create time. Nullable because the kid
  // survives deletion of the creator parent — household ownership is
  // authoritative now.
  parentId: UUID.nullable(),
  name: z.string().min(1).max(40),
  birthYear: z.number().int().min(minBirthYear).max(maxBirthYear).nullable(),
  avatarKey: AvatarKey.nullable(),
  weeklyAllowanceCents: Cents,
  createdAt: IsoTimestamp,
});
export type Kid = z.infer<typeof KidSchema>;

export const CreateKidSchema = z.object({
  name: z.string().min(1).max(40),
  birthYear: z.number().int().min(minBirthYear).max(maxBirthYear).optional(),
  avatarKey: AvatarKey.optional(),
  pin: z.string().regex(/^\d{4}$/, 'pin must be 4 digits').optional(),
  weeklyAllowanceCents: z.number().int().min(0).default(0),
});
export type CreateKidInput = z.infer<typeof CreateKidSchema>;

export const UpdateKidSchema = CreateKidSchema.partial();
export type UpdateKidInput = z.infer<typeof UpdateKidSchema>;
