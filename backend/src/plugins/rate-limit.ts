import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
  // Global default: 200/min per IP for every route. Routes that need a
  // tighter ceiling opt in via `config: { rateLimit: { max, timeWindow } }`
  // — Fastify's plugin merges per-route overrides on top of these
  // defaults, so the route-level settings (e.g. 30/hour for
  // /parent/balance/adjust, 5/hour for /parent/household/invites) still
  // take precedence and remain stricter than the global default.
  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    redis: getRedis(),
    nameSpace: 'rl:',
  });
});
