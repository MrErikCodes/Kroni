import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids, type KidRow } from '../db/schema/kids.js';
import { kidInstalls } from '../db/schema/kid-installs.js';
import { UnauthorizedError } from '../lib/errors.js';
import { tagSentryScope } from '../lib/sentry.js';
import { verifyKidJwt, shouldRefreshKidJwt, refreshKidJwt, type KidJwtPayload } from '../lib/jwt.js';

function readDiagnosticHeader(value: string | string[] | undefined, max = 200): string | null {
  if (Array.isArray(value)) value = value[0];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

declare module 'fastify' {
  interface FastifyRequest {
    kid?: KidRow;
    kidJwt?: KidJwtPayload;
  }
  interface FastifyInstance {
    requireKid: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authKidPlugin = fp(async (app: FastifyInstance) => {
  app.decorate('requireKid', async (req: FastifyRequest, reply: FastifyReply) => {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedError('missing bearer token');
    }
    const token = header.slice(7).trim();
    const payload = verifyKidJwt(token);

    const db = getDb();
    const rows = await db.select().from(kids).where(eq(kids.id, payload.sub)).limit(1);
    const kid = rows[0];
    if (!kid) throw new UnauthorizedError('kid not found');
    // parent_id in the JWT is the creator parent at pair time. With the new
    // household model the kid lives on after the creator deletes their
    // account, so accept either an exact match OR a now-null parentId.
    if (kid.parentId !== null && kid.parentId !== payload.parent_id) {
      throw new UnauthorizedError('parent mismatch');
    }
    // Token-version revocation. Tokens issued before the column existed
    // omit `tv` (treated as 0); a bump on kids.token_version invalidates
    // every previously issued token for this kid.
    const tokenTv = payload.tv ?? 0;
    if (tokenTv !== kid.tokenVersion) {
      throw new UnauthorizedError('token revoked');
    }

    req.kid = kid;
    req.kidJwt = payload;

    // Tag log + upsert kid_installs so support can join from a "Kopier
    // app info" blob to recent server activity. Mirrors the parent
    // pipeline; same Sentry tag surface coming up.
    const installId = readDiagnosticHeader(req.headers['x-kroni-install-id']);
    const platform = readDiagnosticHeader(req.headers['x-kroni-platform'], 16);
    const appVersion = readDiagnosticHeader(req.headers['x-kroni-app-version'], 32);
    const appBuild = readDiagnosticHeader(req.headers['x-kroni-app-build'], 32);
    const osVersion = readDiagnosticHeader(req.headers['x-kroni-os-version'], 32);
    req.log = req.log.child({
      app_role: 'kid',
      kid_id: kid.id,
      household_id: kid.householdId,
      ...(installId ? { install_id: installId } : {}),
      ...(platform ? { platform } : {}),
      ...(appVersion ? { app_version: appVersion } : {}),
      ...(appBuild ? { app_build: appBuild } : {}),
    });

    tagSentryScope(req, {
      appRole: 'kid',
      userId: kid.id,
      householdId: kid.householdId,
      installId,
      appVersion,
      appBuild,
      platform,
    });

    if (installId) {
      void db
        .insert(kidInstalls)
        .values({
          kidId: kid.id,
          installId,
          platform,
          appVersion,
          appBuild,
          osVersion,
          lastSeenAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [kidInstalls.kidId, kidInstalls.installId],
          set: {
            platform,
            appVersion,
            appBuild,
            osVersion,
            lastSeenAt: new Date(),
          },
        })
        .catch((err) => {
          req.log.warn({ err }, 'failed to upsert kid_install');
        });
    }

    if (shouldRefreshKidJwt(payload)) {
      void reply.header('x-token-refresh', refreshKidJwt(payload));
    }
  });
});
