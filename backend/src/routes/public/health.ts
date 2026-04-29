import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const HealthResponse = z.object({
  status: z.literal('ok'),
  uptime: z.number(),
  version: z.string(),
});

const VERSION = process.env.npm_package_version ?? '0.1.0';
const startedAt = Date.now();

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/public/health', {
    schema: { response: { 200: HealthResponse } },
  }, async () => ({
    status: 'ok' as const,
    uptime: Math.round((Date.now() - startedAt) / 1000),
    version: VERSION,
  }));
}
