import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  CreateHouseholdInviteSchema,
  CreateHouseholdInviteResponseSchema,
  HouseholdInviteSchema,
  HouseholdSummarySchema,
  JoinHouseholdRequestSchema,
  JoinHouseholdResponseSchema,
} from '@kroni/shared';
import {
  acceptHouseholdInvite,
  createHouseholdInvite,
  listActiveInvites,
  listHouseholdMembers,
  revokeInvite,
} from '../../services/household.service.js';
import { NotFoundError, UnauthorizedError } from '../../lib/errors.js';
import { serializeHousehold, serializeHouseholdInvite, serializeHouseholdMember } from './_serializers.js';

const CodeParam = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export async function parentHouseholdRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/parent/household/me',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: HouseholdSummarySchema } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const members = await listHouseholdMembers(household.id);
      return {
        household: serializeHousehold(household),
        members: members.map((m) =>
          serializeHouseholdMember(m, household.premiumOwnerParentId),
        ),
      };
    },
  );

  r.post(
    '/api/parent/household/invites',
    {
      preHandler: app.requireParent,
      // Mirror the parent pairing-code rate ceiling but tighter: 5/hour/parent.
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
      schema: {
        body: CreateHouseholdInviteSchema,
        response: { 200: CreateHouseholdInviteResponseSchema },
      },
    },
    async (req) => {
      const parent = req.parent;
      const household = req.household;
      if (!parent || !household) throw new UnauthorizedError('household missing');
      const result = await createHouseholdInvite(
        household.id,
        parent.id,
        req.body.invitedEmail ?? null,
      );
      return {
        code: result.code,
        expiresAt: result.expiresAt.toISOString(),
      } as const;
    },
  );

  r.get(
    '/api/parent/household/invites',
    {
      preHandler: app.requireParent,
      schema: { response: { 200: z.array(HouseholdInviteSchema) } },
    },
    async (req) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const invites = await listActiveInvites(household.id);
      return invites.map(serializeHouseholdInvite);
    },
  );

  r.delete(
    '/api/parent/household/invites/:code',
    {
      preHandler: app.requireParent,
      schema: { params: CodeParam, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const household = req.household;
      if (!household) throw new UnauthorizedError('household missing');
      const ok = await revokeInvite(household.id, req.params.code);
      if (!ok) throw new NotFoundError('invite not found');
      void reply.code(204);
      return null;
    },
  );

  // Auth-gated by Clerk session, but path-prefixed under /api/public/ to
  // signal the joining parent may not yet be in any household. Body validates
  // the invite code; the Clerk preHandler also runs ensureHouseholdForParent
  // for the joiner so we delete that placeholder household before assigning.
  r.post(
    '/api/public/household/join',
    {
      preHandler: app.requireParent,
      schema: {
        body: JoinHouseholdRequestSchema,
        response: { 200: JoinHouseholdResponseSchema },
      },
    },
    async (req) => {
      const parent = req.parent;
      if (!parent) throw new UnauthorizedError('parent missing');
      const result = await acceptHouseholdInvite(req.body.code, parent.id);
      return result;
    },
  );
}
