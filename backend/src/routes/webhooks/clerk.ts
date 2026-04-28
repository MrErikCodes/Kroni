import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { parents } from '../../db/schema/parents.js';
import { ensureHouseholdForParent } from '../../services/household.service.js';
import { getConfig } from '../../config.js';
import { UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

interface ClerkUserCreatedOrUpdated {
  type: 'user.created' | 'user.updated';
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
}

interface ClerkUserDeleted {
  type: 'user.deleted';
  data: { id: string };
}

type ClerkEvent = ClerkUserCreatedOrUpdated | ClerkUserDeleted | { type: string; data: unknown };

export async function clerkWebhookRoutes(app: FastifyInstance): Promise<void> {
  const cfg = getConfig();
  const wh = new Webhook(cfg.CLERK_WEBHOOK_SECRET);

  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      try {
        done(null, body);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post('/api/webhooks/clerk', async (req, reply) => {
    const headers = req.headers;
    const id = headers['svix-id'];
    const timestamp = headers['svix-timestamp'];
    const signature = headers['svix-signature'];
    if (typeof id !== 'string' || typeof timestamp !== 'string' || typeof signature !== 'string') {
      throw new UnauthorizedError('missing svix headers');
    }
    if (typeof req.body !== 'string') {
      throw new BadRequestError('expected raw body');
    }
    let event: ClerkEvent;
    try {
      event = wh.verify(req.body, {
        'svix-id': id,
        'svix-timestamp': timestamp,
        'svix-signature': signature,
      }) as ClerkEvent;
    } catch {
      throw new UnauthorizedError('invalid svix signature');
    }

    const db = getDb();
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const ev = event as ClerkUserCreatedOrUpdated;
      const primaryEmailId = ev.data.primary_email_address_id;
      const email = ev.data.email_addresses?.find((e) => e.id === primaryEmailId)?.email_address;
      if (!email) {
        req.log.warn({ clerkUserId: ev.data.id }, 'clerk event missing primary email; skipping');
        return reply.code(202).send({ ok: true, skipped: 'no email' });
      }
      const displayName =
        [ev.data.first_name, ev.data.last_name].filter(Boolean).join(' ') || null;
      const upserted = await db
        .insert(parents)
        .values({ clerkUserId: ev.data.id, email, displayName })
        .onConflictDoUpdate({
          target: parents.clerkUserId,
          set: { email, displayName, updatedAt: new Date() },
        })
        .returning();
      const parent = upserted[0];
      if (parent) {
        // Materialize the household up front so the very next API call from
        // this user finds an established household. Idempotent.
        try {
          await ensureHouseholdForParent(parent);
        } catch (err) {
          logger.error({ err, parentId: parent.id }, 'ensureHouseholdForParent failed in webhook');
        }
      }
      return reply.code(200).send({ ok: true });
    }
    if (event.type === 'user.deleted') {
      const ev = event as ClerkUserDeleted;
      // Delete the parent row only. Households intentionally have no FK back
      // to parents, so the household survives even if this was the last
      // member — last-member cleanup is a separate concern handled by a
      // future job ([TODO household] reaper for empty households).
      await db.delete(parents).where(eq(parents.clerkUserId, ev.data.id));
      return reply.code(200).send({ ok: true });
    }
    // Unknown event types are no-ops with 200 to avoid Clerk retries.
    return reply.code(200).send({ ok: true, ignored: event.type });
  });
}
