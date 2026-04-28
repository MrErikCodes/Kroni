import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { kidDevices } from '../../db/schema/pairing.js';
import { UnauthorizedError } from '../../lib/errors.js';

const Body = z.object({
  pushToken: z.string().min(1).max(200).nullable(),
});
const Response = z.object({ ok: z.literal(true) });

export async function kidDeviceRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.post(
    '/api/kid/device',
    {
      preHandler: app.requireKid,
      schema: { body: Body, response: { 200: Response } },
    },
    async (req) => {
      const kid = req.kid;
      const jwt = req.kidJwt;
      if (!kid || !jwt) throw new UnauthorizedError('kid missing');
      await getDb()
        .update(kidDevices)
        .set({ pushToken: req.body.pushToken, lastSeenAt: new Date() })
        .where(and(eq(kidDevices.kidId, kid.id), eq(kidDevices.deviceId, jwt.device_id)));
      return { ok: true } as const;
    },
  );
}
