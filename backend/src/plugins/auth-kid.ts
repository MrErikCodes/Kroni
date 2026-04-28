import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kids, type KidRow } from '../db/schema/kids.js';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyKidJwt, shouldRefreshKidJwt, refreshKidJwt, type KidJwtPayload } from '../lib/jwt.js';

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

    req.kid = kid;
    req.kidJwt = payload;

    if (shouldRefreshKidJwt(payload)) {
      void reply.header('x-token-refresh', refreshKidJwt(payload));
    }
  });
});
