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
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../lib/errors.js';
import { serializeHousehold, serializeHouseholdInvite, serializeHouseholdMember } from './_serializers.js';
import { sendMail, MailpaceError } from '../../lib/mailpace.js';
import {
  loadTemplate,
  isSupportedLocale,
  type SupportedLocale,
} from '../../lib/email-templates.js';

// Universal-link landing for an invite. The website at
// `website/app/[lang]/invite/[code]/page.tsx` extracts the `code` segment,
// shows the invite UI, and bounces the browser to `kroni://invite?code=…`
// (custom-scheme fallback) while iOS AASA / Android App Links route the
// same URL straight into `mobile/app/invite/[code].tsx`. kroni.no is the
// canonical brand domain — kroni.se / kroni.dk are not deep-link hosts.
const INVITE_ACCEPT_BASE_URL = 'https://kroni.no/invite';

const CodeParam = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export async function parentHouseholdRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/parent/household/me',
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
    '/parent/household/invites',
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
      if (household.premiumOwnerParentId !== parent.id) {
        throw new ForbiddenError('only the household owner can send invites');
      }
      const invitedEmail = req.body.invitedEmail ?? null;
      const result = await createHouseholdInvite(
        household.id,
        parent.id,
        invitedEmail,
      );
      // If the inviter supplied an email address, also send a branded
      // invitation through Mailpace. Failure here MUST NOT block the
      // route response — the code is already valid in the DB and the
      // mobile app is showing it on the share sheet too. Wrap + log.
      if (invitedEmail) {
        try {
          // Pick the locale of the inviter; the recipient's locale is
          // unknown until they sign up. Fallback chain in loadTemplate
          // handles any unknown values.
          const locale: SupportedLocale = isSupportedLocale(parent.locale)
            ? parent.locale
            : 'nb-NO';
          const inviterName = parent.displayName?.trim() || 'Someone';
          const householdName = household.name?.trim() || 'Your family';
          const acceptUrl = `${INVITE_ACCEPT_BASE_URL}/${result.code}`;
          const tpl = loadTemplate('household-invite', locale, {
            inviterName,
            householdName,
            code: result.code,
            acceptUrl,
          });
          await sendMail({
            to: invitedEmail,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          });
          req.log.info(
            { householdId: household.id, code: result.code, locale },
            'household invite email sent',
          );
        } catch (err) {
          if (err instanceof MailpaceError) {
            req.log.error(
              { err, status: err.status, body: err.body, householdId: household.id },
              'household invite email failed (mailpace)',
            );
          } else {
            req.log.error(
              { err, householdId: household.id },
              'household invite email failed',
            );
          }
        }
      }
      return {
        code: result.code,
        expiresAt: result.expiresAt.toISOString(),
      } as const;
    },
  );

  r.get(
    '/parent/household/invites',
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
    '/parent/household/invites/:code',
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

  // Auth-gated by Clerk session, but path-prefixed under /public/ to
  // signal the joining parent may not yet be in any household. Body validates
  // the invite code; the Clerk preHandler also runs ensureHouseholdForParent
  // for the joiner so we delete that placeholder household before assigning.
  r.post(
    '/public/household/join',
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
