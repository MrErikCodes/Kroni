import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { getConfig } from '../config.js';
import { getDb } from '../db/index.js';
import { parents, type ParentRow } from '../db/schema/parents.js';
import { parentInstalls } from '../db/schema/parent-installs.js';
import { households, type HouseholdRow } from '../db/schema/households.js';
import { ensureHouseholdForParent } from '../services/household.service.js';
import { UnauthorizedError } from '../lib/errors.js';
import { tagSentryScope } from '../lib/sentry.js';

// Trim and clip client-supplied diagnostic headers so a malicious or
// misbehaving client can't blow up our DB / log lines. Returns null for
// missing or empty values.
function readDiagnosticHeader(value: string | string[] | undefined, max = 200): string | null {
  if (Array.isArray(value)) value = value[0];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

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

    // Tag every subsequent log line for this request with the install id +
    // app metadata so support can grep by install_id (the value pasted via
    // "Kopier app info") and find a full server-side replay. Same fields
    // become Sentry tags on the client. Client headers may be absent —
    // we still tag with the parent + household ids so authenticated
    // requests are always identifiable in logs.
    const installId = readDiagnosticHeader(req.headers['x-kroni-install-id']);
    const platform = readDiagnosticHeader(req.headers['x-kroni-platform'], 16);
    const appVersion = readDiagnosticHeader(req.headers['x-kroni-app-version'], 32);
    const appBuild = readDiagnosticHeader(req.headers['x-kroni-app-build'], 32);
    const osVersion = readDiagnosticHeader(req.headers['x-kroni-os-version'], 32);
    req.log = req.log.child({
      app_role: 'parent',
      parent_id: parent.id,
      household_id: household.id,
      ...(installId ? { install_id: installId } : {}),
      ...(platform ? { platform } : {}),
      ...(appVersion ? { app_version: appVersion } : {}),
      ...(appBuild ? { app_build: appBuild } : {}),
    });

    // Mirror the same identifiers onto the Sentry isolation scope so any
    // event captured during this request lands with the same join keys.
    // Email intentionally omitted from Sentry scope — same PII-minimization
    // pass that already removed it from setUser identity (todo.md
    // 2026-04-29). Keep the join keys (parent_id, household_id) so support
    // can still pivot from a Sentry event to logs.
    tagSentryScope(req, {
      appRole: 'parent',
      userId: parent.id,
      householdId: household.id,
      installId,
      appVersion,
      appBuild,
      platform,
    });

    // Upsert the install row. Fire-and-forget so a slow write never
    // blocks the request; surface any error in logs only. Skip when the
    // client didn't send an install id (older clients, web).
    if (installId) {
      void db
        .insert(parentInstalls)
        .values({
          parentId: parent.id,
          installId,
          platform,
          appVersion,
          appBuild,
          osVersion,
          lastSeenAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [parentInstalls.parentId, parentInstalls.installId],
          set: {
            platform,
            appVersion,
            appBuild,
            osVersion,
            lastSeenAt: new Date(),
          },
        })
        .catch((err) => {
          req.log.warn({ err }, 'failed to upsert parent_install');
        });
    }
  });
});
