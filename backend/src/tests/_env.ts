// Test-suite env bootstrap. Loaded via `tsx --import` before any test module
// runs so the production `getDb()` singleton in `src/db/index.ts` reads
// whatever DATABASE_URL phase injects. Set TEST_DATABASE_URL in phase if you
// want to point tests at a separate database; otherwise the dev DB is used.
//
// Clerk + JWT + Mailpace secrets are pinned to placeholders so config.zod's
// `.min(1)` / `.min(32)` validation passes without populated secret values.

import 'dotenv/config';

process.env.NODE_ENV = 'test';

// If TEST_DATABASE_URL is set, use it; otherwise fall back to phase's
// DATABASE_URL (the dev DB).
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);
process.env.MAILPACE_API_TOKEN ??= 'mp_test_placeholder';
