import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { getConfig } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './plugins/error-handler.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { authClerkPlugin } from './plugins/auth-clerk.js';
import { authKidPlugin } from './plugins/auth-kid.js';
import { healthRoutes } from './routes/public/health.js';
import { publicPairRoutes } from './routes/public/pair.js';
import { parentPairingRoutes } from './routes/parent/pairing.js';

export interface BuildOptions {
  fastifyOpts?: FastifyServerOptions;
}

export async function buildApp(opts: BuildOptions = {}): Promise<FastifyInstance> {
  const cfg = getConfig();

  const app = Fastify({
    logger,
    trustProxy: true,
    disableRequestLogging: cfg.NODE_ENV === 'test',
    ...opts.fastifyOpts,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandler);
  await app.register(sensible);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // mobile apps and tools
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      if (origin === cfg.APP_WEBSITE_URL || origin === `${cfg.APP_WEBSITE_URL}/`) {
        return cb(null, true);
      }
      cb(null, false);
    },
    credentials: true,
  });
  await app.register(rateLimitPlugin);
  await app.register(authClerkPlugin);
  await app.register(authKidPlugin);

  await app.register(healthRoutes);
  await app.register(publicPairRoutes);
  await app.register(parentPairingRoutes);

  return app;
}
