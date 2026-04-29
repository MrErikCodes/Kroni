import { z } from 'zod';
import 'dotenv/config';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),
  // Separate Postgres database used by `npm test` so suite runs never mutate
  // dev data. Defaults to a sibling `kroni_test` DB on the same instance; the
  // local `_env.ts` test bootstrap copies this onto DATABASE_URL before any
  // module reads config so the singleton in `db/index.ts` connects to it.
  TEST_DATABASE_URL: z
    .string()
    .url()
    .default('postgres://kroni:kroni@localhost:5432/kroni_test'),
  REDIS_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  KID_JWT_SECRET: z.string().min(32),

  EXPO_ACCESS_TOKEN: z.string().optional(),
  REVENUECAT_WEBHOOK_AUTH: z.string().optional(),

  // Mailpace transactional email. Server token from the Mailpace dashboard;
  // domain-scoped, so this token can only send `from: *@kroni.no`.
  MAILPACE_API_TOKEN: z.string().min(1),
  // Verified sending address. Must match a domain authenticated in
  // Mailpace (SPF/DKIM/DMARC on kroni.no — see docs/email.md).
  MAILPACE_FROM_EMAIL: z.string().email().default('noreply@kroni.no'),
  // Friendly From: display name. Renders as `Kroni <noreply@kroni.no>`.
  MAILPACE_FROM_NAME: z.string().default('Kroni'),

  // Crash + error reporting. Optional so dev / tests run without it.
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_RELEASE: z.string().optional(),
  // Default low (10%) so we get distributed-trace links to mobile
  // without flooding the project. Bump to 1.0 in dev for full visibility.
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),

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
