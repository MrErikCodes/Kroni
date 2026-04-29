import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PairRequestSchema, PairResponseSchema } from '@kroni/shared';
import { redeemPairingCode, checkRateLimit } from '../../services/pairing.service.js';
import { RateLimitError } from '../../lib/errors.js';

export async function publicPairRoutes(app: FastifyInstance): Promise<void> {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/public/pair',
    {
      schema: {
        body: PairRequestSchema,
        response: { 200: PairResponseSchema },
      },
    },
    async (req, reply) => {
      const ip = req.ip;
      const ipLimit = await checkRateLimit('pair-ip', ip, 5, 60 * 60); // 5 / hour / IP
      if (!ipLimit.ok) {
        void reply.header('retry-after', String(ipLimit.resetSeconds));
        throw new RateLimitError(`too many pairing attempts from ip; retry in ${ipLimit.resetSeconds}s`);
      }
      const deviceLimit = await checkRateLimit('pair-device', req.body.deviceId, 10, 24 * 60 * 60); // 10 / day / device
      if (!deviceLimit.ok) {
        void reply.header('retry-after', String(deviceLimit.resetSeconds));
        throw new RateLimitError(`too many pairing attempts for device; retry in ${deviceLimit.resetSeconds}s`);
      }
      const result = await redeemPairingCode(req.body);
      return result;
    },
  );
}
