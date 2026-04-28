import { z } from 'zod';
import { IsoTimestamp, AvatarKey } from './common.js';
import { KidSchema } from './kid.js';

export const PairingCodeRegex = /^\d{6}$/;

export const GeneratePairingCodeResponseSchema = z.object({
  code: z.string().regex(PairingCodeRegex),
  expiresAt: IsoTimestamp,
});
export type GeneratePairingCodeResponse = z.infer<typeof GeneratePairingCodeResponseSchema>;

const currentYear = new Date().getUTCFullYear();

export const PairRequestSchema = z.object({
  code: z.string().regex(PairingCodeRegex),
  name: z.string().min(1).max(40),
  birthYear: z.number().int().min(currentYear - 25).max(currentYear).optional(),
  avatarKey: AvatarKey.optional(),
  deviceId: z.string().min(8).max(128),
});
export type PairRequest = z.infer<typeof PairRequestSchema>;

export const PairResponseSchema = z.object({
  token: z.string().min(20),
  kid: KidSchema,
});
export type PairResponse = z.infer<typeof PairResponseSchema>;
