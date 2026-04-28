import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  GeneratePairingCodeRequestSchema,
  GeneratePairingCodeResponseSchema,
} from '@kroni/shared';
import { createPairingCode } from '../../services/pairing.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

export async function parentPairingRoutes(app: FastifyInstance): Promise<void> {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/api/parent/pairing-code',
    {
      preHandler: app.requireParent,
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
      schema: {
        body: GeneratePairingCodeRequestSchema,
        response: { 200: GeneratePairingCodeResponseSchema },
      },
    },
    async (req) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      const result = await createPairingCode(household.id, parent.id, req.body.kidId);
      return {
        code: result.code,
        expiresAt: result.expiresAt.toISOString(),
      } as const;
    },
  );
}
