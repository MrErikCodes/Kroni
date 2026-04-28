import type { FastifyInstance } from 'fastify';
import { GeneratePairingCodeResponseSchema } from '@kroni/shared';
import { createPairingCode } from '../../services/pairing.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

export async function parentPairingRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/parent/pairing-code',
    {
      preHandler: app.requireParent,
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
      schema: { response: { 200: GeneratePairingCodeResponseSchema } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const result = await createPairingCode(parent.id);
      return {
        code: result.code,
        expiresAt: result.expiresAt.toISOString(),
      } as const;
    },
  );
}
