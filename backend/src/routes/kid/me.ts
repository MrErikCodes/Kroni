import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { KidSchema } from '@kroni/shared';
import { UnauthorizedError } from '../../lib/errors.js';

export async function kidMeRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get(
    '/api/kid/me',
    { preHandler: app.requireKid, schema: { response: { 200: KidSchema } } },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      const { id, parentId, name, birthYear, avatarKey, weeklyAllowanceCents, createdAt } = kid;
      return {
        id,
        parentId,
        name,
        birthYear,
        avatarKey,
        weeklyAllowanceCents,
        createdAt: createdAt.toISOString(),
      } as never;
    },
  );
}
