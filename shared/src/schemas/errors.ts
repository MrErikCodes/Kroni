import { z } from 'zod';

// RFC 7807 problem detail. Backend emits, mobile parses.
export const ProblemDetailSchema = z.object({
  type: z.string().url().or(z.literal('about:blank')),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  // Allow extension members for validation issues etc.
  errors: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })).optional(),
}).passthrough();

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
