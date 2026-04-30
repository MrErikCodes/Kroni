// Test-suite env bootstrap. Loaded via `tsx --import` before any test module
// runs. We let phase's DATABASE_URL flow through to the production
// `getDb()` singleton — that means tests run against the *dev* DB by
// design. Isolation comes from `helpers/db.ts`'s snapshot+cleanup model
// (snapshot pre-existing PKs, then DELETE only rows added during the test).
// Production DBs are blocked by an explicit guard in `helpers/db.ts`.
//
// Clerk + JWT + Mailpace secrets are pinned to placeholders so config.zod's
// `.min(1)` / `.min(32)` validation passes without populated secret values.

import 'dotenv/config';

process.env.NODE_ENV = 'test';

process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);
process.env.MAILPACE_API_TOKEN ??= 'mp_test_placeholder';

process.env.CLERK_SECRET_KEY ??= 'sk_test_placeholder';
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_placeholder';
process.env.CLERK_WEBHOOK_SECRET ??= 'whsec_placeholder';
process.env.KID_JWT_SECRET ??= '0'.repeat(64);
process.env.MAILPACE_API_TOKEN ??= 'mp_test_placeholder';
