import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    global: false,
    max: 200,
    timeWindow: '1 minute',
    redis: getRedis(),
    nameSpace: 'rl:',
  });
});
