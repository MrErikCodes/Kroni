import { z } from 'zod';
import 'dotenv/config';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  KID_JWT_SECRET: z.string().min(32),

  EXPO_ACCESS_TOKEN: z.string().optional(),
  REVENUECAT_WEBHOOK_AUTH: z.string().optional(),

  // Crash + error reporting. Optional so dev / tests run without it.
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_RELEASE: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),

  APP_TIMEZONE: z.string().default('Europe/Oslo'),
  APP_PUBLIC_URL: z.string().url().default('https://api.kroni.no'),
  APP_WEBSITE_URL: z.string().url().default('https://kroni.no'),
});

export type Config = z.infer<typeof Env>;

let cached: Config | undefined;

export function getConfig(): Config {
  if (cached) return cached;
  const parsed = Env.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // Fail fast — never start the server with a broken environment.
    throw new Error(`Invalid environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function resetConfigForTests(): void {
  cached = undefined;
}
