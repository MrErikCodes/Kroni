import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { getConfig } from '../config.js';
import { getDb } from '../db/index.js';
import { parents, type ParentRow } from '../db/schema/parents.js';
import { households, type HouseholdRow } from '../db/schema/households.js';
import { ensureHouseholdForParent } from '../services/household.service.js';
import { UnauthorizedError } from '../lib/errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    parent?: ParentRow;
    household?: HouseholdRow;
  }
  interface FastifyInstance {
    requireParent: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    clerk: ReturnType<typeof createClerkClient>;
  }
}

export const authClerkPlugin = fp(async (app: FastifyInstance) => {
  const cfg = getConfig();
  const clerk = createClerkClient({
    secretKey: cfg.CLERK_SECRET_KEY,
    publishableKey: cfg.CLERK_PUBLISHABLE_KEY,
  });
  app.decorate('clerk', clerk);

  app.decorate('requireParent', async (req: FastifyRequest, _reply: FastifyReply) => {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedError('missing bearer token');
    }
    const token = header.slice(7).trim();
    let payload: { sub: string };
    try {
      payload = (await verifyToken(token, {
        secretKey: cfg.CLERK_SECRET_KEY,
      })) as { sub: string };
    } catch {
      throw new UnauthorizedError('invalid clerk token');
    }
    const clerkUserId = payload.sub;
    if (!clerkUserId) throw new UnauthorizedError('token missing sub');

    const db = getDb();
    const rows = await db.select().from(parents).where(eq(parents.clerkUserId, clerkUserId)).limit(1);
    let parent = rows[0];
    if (!parent) {
      // First call after sign-up before webhook lands — backfill from Clerk.
      try {
        const user = await clerk.users.getUser(clerkUserId);
        const primaryEmail = user.emailAddresses.find(
          (e: { id: string; emailAddress: string }) => e.id === user.primaryEmailAddressId,
        )?.emailAddress;
        if (!primaryEmail) throw new UnauthorizedError('clerk user has no email');
        const inserted = await db
          .insert(parents)
          .values({
            clerkUserId,
            email: primaryEmail,
            displayName: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          })
          .onConflictDoUpdate({
            target: parents.clerkUserId,
            set: { updatedAt: new Date() },
          })
          .returning();
        parent = inserted[0];
      } catch {
        throw new UnauthorizedError('clerk user lookup failed');
      }
    }
    if (!parent) throw new UnauthorizedError('parent backfill failed');

    // Resolve / lazy-create the household. ensureHouseholdForParent is
    // idempotent; the common path is a single SELECT.
    let household: HouseholdRow;
    if (parent.householdId) {
      const hh = await db
        .select()
        .from(households)
        .where(eq(households.id, parent.householdId))
        .limit(1);
      const existing = hh[0];
      if (existing) {
        household = existing;
      } else {
        // householdId points at a vanished row — recreate.
        household = await ensureHouseholdForParent(parent);
        parent = { ...parent, householdId: household.id };
      }
    } else {
      household = await ensureHouseholdForParent(parent);
      parent = { ...parent, householdId: household.id };
    }

    req.parent = parent;
    req.household = household;
  });
});
