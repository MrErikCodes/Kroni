import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { getConfig } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './plugins/error-handler.js';
import { attachSentryToFastify } from './lib/sentry.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { authClerkPlugin } from './plugins/auth-clerk.js';
import { authKidPlugin } from './plugins/auth-kid.js';
import { healthRoutes } from './routes/public/health.js';
import { publicPairRoutes } from './routes/public/pair.js';
import { parentPairingRoutes } from './routes/parent/pairing.js';
import { parentMeRoutes } from './routes/parent/me.js';
import { parentKidsRoutes } from './routes/parent/kids.js';
import { parentTasksRoutes } from './routes/parent/tasks.js';
import { parentRewardsRoutes } from './routes/parent/rewards.js';
import { parentApprovalsRoutes } from './routes/parent/approvals.js';
import { parentBalanceRoutes } from './routes/parent/balance.js';
import { parentBillingRoutes } from './routes/parent/billing.js';
import { parentHouseholdRoutes } from './routes/parent/household.js';
import { parentDeviceRoutes } from './routes/parent/device.js';
import { clerkWebhookRoutes } from './routes/webhooks/clerk.js';
import { revenuecatWebhookRoutes } from './routes/webhooks/revenuecat.js';
import { kidMeRoutes } from './routes/kid/me.js';
import { kidTodayRoutes } from './routes/kid/today.js';
import { kidTasksRoutes } from './routes/kid/tasks.js';
import { kidBalanceRoutes } from './routes/kid/balance.js';
import { kidDeviceRoutes } from './routes/kid/device.js';
import { kidRewardsRoutes } from './routes/kid/rewards.js';

export interface BuildOptions {
  fastifyOpts?: FastifyServerOptions;
}

export async function buildApp(opts: BuildOptions = {}): Promise<FastifyInstance> {
  const cfg = getConfig();

  const app = Fastify({
    loggerInstance: logger,
    trustProxy: true,
    disableRequestLogging: cfg.NODE_ENV === 'test',
    ...opts.fastifyOpts,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandler);
  await app.register(sensible);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimitPlugin);
  await app.register(authClerkPlugin);
  await app.register(authKidPlugin);

  await app.register(healthRoutes);
  await app.register(publicPairRoutes);
  await app.register(clerkWebhookRoutes);
  await app.register(revenuecatWebhookRoutes);

  await app.register(parentPairingRoutes);
  await app.register(parentMeRoutes);
  await app.register(parentKidsRoutes);
  await app.register(parentTasksRoutes);
  await app.register(parentRewardsRoutes);
  await app.register(parentApprovalsRoutes);
  await app.register(parentBalanceRoutes);
  await app.register(parentBillingRoutes);
  await app.register(parentHouseholdRoutes);
  await app.register(parentDeviceRoutes);

  await app.register(kidMeRoutes);
  await app.register(kidTodayRoutes);
  await app.register(kidTasksRoutes);
  await app.register(kidBalanceRoutes);
  await app.register(kidDeviceRoutes);
  await app.register(kidRewardsRoutes);

  // Sentry's Fastify error handler hooks `onError` so we register it after
  // routes are wired. Becomes a no-op when SENTRY_DSN is unset.
  attachSentryToFastify(app);

  return app;
}
