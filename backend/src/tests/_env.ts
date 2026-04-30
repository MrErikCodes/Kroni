// Test-suite env bootstrap. Loaded via `tsx --import` before any test module
// runs so the production `getDb()` singleton in `src/db/index.ts` reads the
// test DB instead of the dev DB. Without this, anything that calls
// `getDb()` (services, routes, app builder) would talk to whatever
// DATABASE_URL phase injects — which during local dev is the real dev DB,
// and `truncateAll()` between tests would wipe it.
//
// We pin every Clerk + JWT + Mailpace secret to placeholders too so
// config.zod's `.min(1)` / `.min(32)` validation passes without a populated
// .env.

import 'dotenv/config';

const TEST_DB_DEFAULT = 'postgres://kroni:kroni@localhost:5432/kroni_test';

process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL ??= TEST_DB_DEFAULT;

// Force DATABASE_URL onto the test DB regardless of what dev .env / phase
// had set. This is the entire point of the test-isolation fix — never let
// the suite touch the dev or prod DB.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);
process.env.MAILPACE_API_TOKEN ??= 'mp_test_placeholder';
