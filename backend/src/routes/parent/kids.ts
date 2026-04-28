import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { CreateKidSchema, UpdateKidSchema, KidSchema } from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { kids } from '../../db/schema/kids.js';
import { kidBalances } from '../../db/schema/balance.js';
import { NotFoundError, UnauthorizedError } from '../../lib/errors.js';
import { assertCanAddKid } from '../../services/billing.service.js';
import { serializeKid } from './_serializers.js';

const IdParam = z.object({ id: z.string().uuid() });

export async function parentKidsRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/parent/kids',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: z.array(KidSchema) } },
    },
    async (req) => {
      if (!req.parent) throw new UnauthorizedError('parent missing');
      const rows = await getDb().select().from(kids).where(eq(kids.parentId, req.parent.id));
      return rows.map(serializeKid);
    },
  );

  r.post(
    '/api/parent/kids',
    {
      preHandler: app.requireParent,
      schema: { body: CreateKidSchema, response: { 201: KidSchema } },
    },
    async (req, reply) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      await assertCanAddKid(parent);
      const hashedPin = req.body.pin ? await bcrypt.hash(req.body.pin, 10) : null;
      const inserted = await getDb()
        .insert(kids)
        .values({
          parentId: parent.id,
          name: req.body.name,
          birthYear: req.body.birthYear ?? null,
          avatarKey: req.body.avatarKey ?? null,
          pin: hashedPin,
          weeklyAllowanceCents: req.body.weeklyAllowanceCents,
        })
        .returning();
      const kid = inserted[0];
      if (!kid) throw new Error('insert failed');
      await getDb().insert(kidBalances).values({ kidId: kid.id, balanceCents: 0 }).onConflictDoNothing();
      void reply.code(201);
      return serializeKid(kid);
    },
  );

  r.get(
    '/api/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 200: KidSchema } },
    },
    async (req) => {
      if (!req.parent) throw new UnauthorizedError('parent missing');
      const rows = await getDb()
        .select()
        .from(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, req.parent.id)))
        .limit(1);
      const kid = rows[0];
      if (!kid) throw new NotFoundError('kid not found');
      return serializeKid(kid);
    },
  );

  r.patch(
    '/api/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, body: UpdateKidSchema, response: { 200: KidSchema } },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const update: Record<string, unknown> = {};
      if (req.body.name !== undefined) update.name = req.body.name;
      if (req.body.birthYear !== undefined) update.birthYear = req.body.birthYear;
      if (req.body.avatarKey !== undefined) update.avatarKey = req.body.avatarKey;
      if (req.body.weeklyAllowanceCents !== undefined) {
        update.weeklyAllowanceCents = req.body.weeklyAllowanceCents;
      }
      if (req.body.pin !== undefined) {
        update.pin = req.body.pin ? await bcrypt.hash(req.body.pin, 10) : null;
      }
      const updated = await getDb()
        .update(kids)
        .set(update)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, parent.id)))
        .returning();
      const kid = updated[0];
      if (!kid) throw new NotFoundError('kid not found');
      return serializeKid(kid);
    },
  );

  r.delete(
    '/api/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const deleted = await getDb()
        .delete(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.parentId, parent.id)))
        .returning({ id: kids.id });
      if (deleted.length === 0) throw new NotFoundError('kid not found');
      void reply.code(204);
      return null;
    },
  );
}
