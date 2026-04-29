# Backend tests — local DB hygiene

`npm test` (in `backend/`) now runs against an isolated `kroni_test` Postgres
DB so test runs never mutate dev data. Migrations are applied at suite start;
every test gets a clean slate via `TRUNCATE ... RESTART IDENTITY CASCADE` of
all `public.*` tables before it runs.

## One-time bootstrap

```bash
# 1. Create the test DB on the same Postgres instance as dev.
createdb kroni_test
# Or, if the `kroni` role doesn't own it yet:
psql -U postgres -c "CREATE DATABASE kroni_test OWNER kroni;"

# 2. (Optional) override the default URL via Phase. Default works on a
#    standard local install: postgres://kroni:kroni@localhost:5432/kroni_test
phase secrets update TEST_DATABASE_URL --value 'postgres://kroni:kroni@localhost:5432/kroni_test'

# 3. Run the suite. Migrations + truncate happen automatically.
cd backend && npm test
```

You do NOT need to run `db:migrate` against `kroni_test` manually —
`setupTestDb()` in `src/tests/helpers/db.ts` calls drizzle's `migrate()` from
`backend/drizzle/` at the start of every suite.

## How it's wired

- `src/tests/_env.ts` — bootstrap loaded via `tsx --import`. Sets `NODE_ENV=test`,
  copies `TEST_DATABASE_URL` → `DATABASE_URL` so the production `getDb()`
  singleton (`src/db/index.ts`) connects to the test DB, fills Clerk / JWT
  placeholders.
- `src/tests/helpers/db.ts` — `setupTestDb()`, `truncateAll()`,
  `teardownTestDb()`. Single shared connection per suite.
- Each DB-bound test file (`pairing.test.ts`, `balance.test.ts`,
  `health.test.ts`) calls `setupTestDb()` in `test.before()`,
  `truncateAll()` in `test.beforeEach()`, and tears down in `test.after()`.
- `allowance.test.ts` is pure logic (no DB) so it skips the lifecycle hooks.

## Caveats

- The test DB lives on the same Postgres instance as dev. Tests are
  destructive against `kroni_test` only — they never touch `kroni`.
- `truncateAll()` skips drizzle's internal `__drizzle_migrations` table so
  the migration metadata stays put between suites.
- The `_env.ts` bootstrap forces `DATABASE_URL = TEST_DATABASE_URL`. Don't
  override that elsewhere or the singleton will reconnect to dev mid-suite.
