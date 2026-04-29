import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getDb } from '../../db/index.js';
import { parentDevices } from '../../db/schema/pairing.js';
import { UnauthorizedError } from '../../lib/errors.js';

const Body = z.object({
  deviceId: z.string().min(1).max(200),
  pushToken: z.string().min(1).max(200),
  platform: z.enum(['ios', 'android']),
});
const Response = z.object({ ok: z.literal(true) });

// Mirror of `kid_devices` for parents. Mobile registers an Expo push
// token here so the backend can deliver RevenueCat-derived billing
// notifications (BILLING_ISSUE, EXPIRATION) to the household owner.
export async function parentDeviceRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.post(
    '/api/parent/devices',
    {
      preHandler: app.requireParent,
      schema: { body: Body, response: { 200: Response } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const { deviceId, pushToken, platform } = req.body;
      await getDb()
        .insert(parentDevices)
        .values({
          parentId: parent.id,
          deviceId,
          pushToken,
          platform,
        })
        .onConflictDoUpdate({
          target: [parentDevices.parentId, parentDevices.deviceId],
          set: {
            pushToken,
            platform,
            updatedAt: new Date(),
          },
        });
      return { ok: true } as const;
    },
  );
}
