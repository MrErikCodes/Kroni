import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { AvatarKey, KidSchema, KidMeResponseSchema, type Currency } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { kids } from '../../db/schema/kids.js';
import { parents } from '../../db/schema/parents.js';
import { NotFoundError, UnauthorizedError } from '../../lib/errors.js';
import { serializeKid } from '../parent/_serializers.js';

// Body for the kid-self PATCH. Today the kid can only change their avatar
// from the kid app — name / birthYear etc. stay parent-controlled.
const UpdateKidMeSchema = z.object({ avatarKey: AvatarKey });

export async function kidMeRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get(
    '/kid/me',
    { preHandler: app.requireKid, schema: { response: { 200: KidMeResponseSchema } } },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      const {
        id,
        parentId,
        name,
        birthYear,
        avatarKey,
        allowanceFrequency,
        allowanceCents,
        allowanceDayOfWeek,
        allowanceDayOfMonth,
        allowanceLastPaidAt,
        createdAt,
      } = kid;
      // Currency lives on the creator parent. Falls back to NOK if the
      // parent row is missing (kid that survived parent deletion).
      let currency: Currency = 'NOK';
      if (parentId) {
        const [row] = await getDb()
          .select({ currency: parents.currency })
          .from(parents)
          .where(eq(parents.id, parentId))
          .limit(1);
        if (row?.currency === 'SEK' || row?.currency === 'DKK' || row?.currency === 'NOK') {
          currency = row.currency;
        }
      }
      return {
        id,
        parentId,
        name,
        birthYear,
        avatarKey,
        allowanceFrequency,
        allowanceCents,
        allowanceDayOfWeek,
        allowanceDayOfMonth,
        allowanceLastPaidAt: allowanceLastPaidAt ? allowanceLastPaidAt.toISOString() : null,
        createdAt: createdAt.toISOString(),
        currency,
      } as never;
    },
  );

  // Kid-self avatar change. Cap at 30/hour per kid token to keep a runaway
  // tap-loop from hammering the DB; the natural UI gating (modal close after
  // save) makes this far higher than any real user would need.
  r.patch(
    '/kid/me',
    {
      preHandler: app.requireKid,
      config: { rateLimit: { max: 30, timeWindow: '1 hour' } },
      schema: { body: UpdateKidMeSchema, response: { 200: KidSchema } },
    },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      // Mirror the parent /kids/:id PATCH pattern: build an update record
      // typed as `Record<string, unknown>` so drizzle's column-typed setters
      // accept fields lifted from `req.body` (Fastify's zod type provider
      // currently surfaces `req.body` as `unknown` repo-wide).
      const update: Record<string, unknown> = { avatarKey: req.body.avatarKey };
      const updated = await getDb()
        .update(kids)
        .set(update)
        .where(eq(kids.id, kid.id))
        .returning();
      const row = updated[0];
      if (!row) throw new NotFoundError('kid not found');
      return serializeKid(row) as never;
    },
  );
}
