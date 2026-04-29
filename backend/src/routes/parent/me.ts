import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ParentSchema, UpdateParentSchema } from '@kroni/shared';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../db/index.js';
import { parents } from '../../db/schema/parents.js';
import { UnauthorizedError } from '../../lib/errors.js';
import { serializeParent } from './_serializers.js';

export async function parentMeRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/parent/me',
    { preHandler: app.requireParent, schema: { response: { 200: ParentSchema } } },
    async (req) => {
      if (!req.parent) throw new UnauthorizedError('parent missing');
      return serializeParent(req.parent);
    },
  );

  r.patch(
    '/parent/me',
    {
      preHandler: app.requireParent,
      schema: { body: UpdateParentSchema, response: { 200: ParentSchema } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (req.body.displayName !== undefined) update.displayName = req.body.displayName;
      if (req.body.locale !== undefined) update.locale = req.body.locale;
      const updated = await getDb()
        .update(parents)
        .set(update)
        .where(eq(parents.id, parent.id))
        .returning();
      const row = updated[0];
      if (!row) throw new UnauthorizedError('parent missing');
      return serializeParent(row);
    },
  );

  // Suppress unused import warnings in some toolchains.
  void z;
}
