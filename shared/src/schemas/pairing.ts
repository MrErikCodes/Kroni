import { z } from 'zod';
import { UUID, IsoTimestamp } from './common.js';
import { KidSchema } from './kid.js';

export const PairingCodeRegex = /^\d{6}$/;

// Parent → POST /api/parent/pairing-code: the kid (already created with name
// + avatar in the parent flow) the code will pair to.
export const GeneratePairingCodeRequestSchema = z.object({
  kidId: UUID,
});
export type GeneratePairingCodeRequest = z.infer<typeof GeneratePairingCodeRequestSchema>;

export const GeneratePairingCodeResponseSchema = z.object({
  code: z.string().regex(PairingCodeRegex),
  expiresAt: IsoTimestamp,
});
export type GeneratePairingCodeResponse = z.infer<typeof GeneratePairingCodeResponseSchema>;

// Kid → POST /api/public/pair: code only. Identity comes from the kid record
// the code targets.
export const PairRequestSchema = z.object({
  code: z.string().regex(PairingCodeRegex),
  deviceId: z.string().min(8).max(128),
});
export type PairRequest = z.infer<typeof PairRequestSchema>;

export const PairResponseSchema = z.object({
  token: z.string().min(20),
  kid: KidSchema,
});
export type PairResponse = z.infer<typeof PairResponseSchema>;
