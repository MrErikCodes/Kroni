import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  CreateKidSchema,
  UpdateKidSchema,
  KidSchema,
  type CreateKidInput,
  type UpdateKidInput,
  type AllowanceFrequency,
} from '@kroni/shared';
import { getDb } from '../../db/index.js';
import { kids } from '../../db/schema/kids.js';
import { kidBalances } from '../../db/schema/balance.js';
import { NotFoundError, UnauthorizedError } from '../../lib/errors.js';
import { assertCanAddKid } from '../../services/billing.service.js';
import { serializeKid } from './_serializers.js';

const IdParam = z.object({ id: z.string().uuid() });

// Resolve the legacy [DEPRECATED weeklyAllowanceCents] alias on writes. When
// the new fields are not provided but weeklyAllowanceCents is, treat it as
// "weekly on Monday". The shared schema's refinement enforces consistency
// of the new fields once they are present.
interface AllowanceWrite {
  allowanceFrequency: AllowanceFrequency;
  allowanceCents: number;
  allowanceDayOfWeek: number | null;
  allowanceDayOfMonth: number | null;
}

function resolveAllowanceCreate(body: CreateKidInput): AllowanceWrite {
  if (body.weeklyAllowanceCents !== undefined && body.allowanceFrequency === 'none' && body.allowanceCents === 0) {
    if (body.weeklyAllowanceCents > 0) {
      return {
        allowanceFrequency: 'weekly',
        allowanceCents: body.weeklyAllowanceCents,
        allowanceDayOfWeek: 1, // Monday
        allowanceDayOfMonth: null,
      };
    }
    return {
      allowanceFrequency: 'none',
      allowanceCents: 0,
      allowanceDayOfWeek: null,
      allowanceDayOfMonth: null,
    };
  }
  return {
    allowanceFrequency: body.allowanceFrequency,
    allowanceCents: body.allowanceCents,
    allowanceDayOfWeek: body.allowanceDayOfWeek ?? null,
    allowanceDayOfMonth: body.allowanceDayOfMonth ?? null,
  };
}

function applyAllowanceUpdate(
  body: UpdateKidInput,
  update: Record<string, unknown>,
): void {
  // New-style fields take precedence. The shared refinement guarantees
  // that any frequency change carries the matching day field(s).
  if (body.allowanceFrequency !== undefined) update.allowanceFrequency = body.allowanceFrequency;
  if (body.allowanceCents !== undefined) update.allowanceCents = body.allowanceCents;
  if (body.allowanceDayOfWeek !== undefined) update.allowanceDayOfWeek = body.allowanceDayOfWeek;
  if (body.allowanceDayOfMonth !== undefined) update.allowanceDayOfMonth = body.allowanceDayOfMonth;

  // Legacy alias: [DEPRECATED weeklyAllowanceCents]. Only honored when the
  // new fields are absent. Maps to weekly + Monday + the supplied cents.
  if (
    body.weeklyAllowanceCents !== undefined &&
    body.allowanceFrequency === undefined &&
    body.allowanceCents === undefined
  ) {
    if (body.weeklyAllowanceCents > 0) {
      update.allowanceFrequency = 'weekly';
      update.allowanceCents = body.weeklyAllowanceCents;
      update.allowanceDayOfWeek = 1;
      update.allowanceDayOfMonth = null;
    } else {
      update.allowanceFrequency = 'none';
      update.allowanceCents = 0;
      update.allowanceDayOfWeek = null;
      update.allowanceDayOfMonth = null;
    }
  }
}

export async function parentKidsRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/parent/kids',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: z.array(KidSchema) } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const rows = await getDb().select().from(kids).where(eq(kids.householdId, household.id));
      return rows.map(serializeKid);
    },
  );

  r.post(
    '/parent/kids',
    {
      preHandler: app.requireParent,
      schema: { body: CreateKidSchema, response: { 201: KidSchema } },
    },
    async (req, reply) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      await assertCanAddKid(household);
      const hashedPin = req.body.pin ? await bcrypt.hash(req.body.pin, 10) : null;
      const allowance = resolveAllowanceCreate(req.body);
      const inserted = await getDb()
        .insert(kids)
        .values({
          householdId: household.id,
          parentId: parent.id,
          name: req.body.name,
          birthYear: req.body.birthYear ?? null,
          avatarKey: req.body.avatarKey ?? null,
          pin: hashedPin,
          allowanceFrequency: allowance.allowanceFrequency,
          allowanceCents: allowance.allowanceCents,
          allowanceDayOfWeek: allowance.allowanceDayOfWeek,
          allowanceDayOfMonth: allowance.allowanceDayOfMonth,
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
    '/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 200: KidSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const rows = await getDb()
        .select()
        .from(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.householdId, household.id)))
        .limit(1);
      const kid = rows[0];
      if (!kid) throw new NotFoundError('kid not found');
      return serializeKid(kid);
    },
  );

  r.patch(
    '/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, body: UpdateKidSchema, response: { 200: KidSchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const update: Record<string, unknown> = {};
      if (req.body.name !== undefined) update.name = req.body.name;
      if (req.body.birthYear !== undefined) update.birthYear = req.body.birthYear;
      if (req.body.avatarKey !== undefined) update.avatarKey = req.body.avatarKey;
      applyAllowanceUpdate(req.body, update);
      if (req.body.pin !== undefined) {
        update.pin = req.body.pin ? await bcrypt.hash(req.body.pin, 10) : null;
      }
      const updated = await getDb()
        .update(kids)
        .set(update)
        .where(and(eq(kids.id, req.params.id), eq(kids.householdId, household.id)))
        .returning();
      const kid = updated[0];
      if (!kid) throw new NotFoundError('kid not found');
      return serializeKid(kid);
    },
  );

  r.delete(
    '/parent/kids/:id',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const deleted = await getDb()
        .delete(kids)
        .where(and(eq(kids.id, req.params.id), eq(kids.householdId, household.id)))
        .returning({ id: kids.id });
      if (deleted.length === 0) throw new NotFoundError('kid not found');
      void reply.code(204);
      return null;
    },
  );

  // Revoke every kid token for a kid in this parent's household.
  // Bumps kids.token_version atomically; the kid auth plugin compares
  // the embedded `tv` claim against the new value and 401s.
  // Owner-or-coparent: any parent in the same household as the kid is
  // authorized, mirroring how DELETE /parent/kids/:id is scoped via
  // household.id (not parent.id).
  const RevokeResponse = z.object({ tokenVersion: z.number().int() });
  r.post(
    '/parent/kids/:id/revoke-tokens',
    {
      preHandler: app.requireParent,
      schema: { params: IdParam, response: { 200: RevokeResponse } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const updated = await getDb()
        .update(kids)
        .set({ tokenVersion: sql`${kids.tokenVersion} + 1` })
        .where(and(eq(kids.id, req.params.id), eq(kids.householdId, household.id)))
        .returning({ tokenVersion: kids.tokenVersion });
      const row = updated[0];
      if (!row) throw new NotFoundError('kid not found');
      return { tokenVersion: row.tokenVersion };
    },
  );
}
