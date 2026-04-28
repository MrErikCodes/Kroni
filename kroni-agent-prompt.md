# Kroni — Full Build Agent Prompt

You are an autonomous coding agent. You will build **Kroni**, a Norwegian/Scandinavian allowance and chore-tracking mobile app, end-to-end. The user has already created two starter templates and wants you to do everything else without further input.

## Current state of the repository

The user is on **Windows** at `C:\Users\nileri\Koding\Kroni`. The current contents are:

```
Kroni/
├── .omc/              ← coding agent workspace metadata, DO NOT TOUCH
├── mobile/            ← fresh `npx create-expo-app` output, EAS project linked
│                        (project id: 0c4171da-0dac-4d60-91b4-dd3fbf8101d8)
└── website/           ← fresh `npx create-next-app@latest` output
```

Both templates are untouched defaults at the latest stable versions. There is **no** root `package.json`, **no** `backend/` folder, **no** `shared/` folder, **no** `.gitignore`, and git is not initialized at the root. You will create all of these.

The user does not want to do anything manually. You execute every step. If you hit a decision that is not covered in this document, make a reasonable choice, document it in a comment, and continue. Do not stop to ask questions.

## Product overview

Kroni lets parents create chore tasks for their children, kids mark them complete in their own app, parents approve completions, and kids accumulate virtual currency (NOK) they can spend on parent-defined rewards. No real money moves through the system — this is intentional to avoid financial regulation. Target market: Norway first, then Sweden and Denmark. Default language: Norwegian Bokmål (`nb-NO`). Currency: NOK, stored as integer øre (1 NOK = 100 øre).

The product has two distinct user types in one mobile app:

- **Parent**: signs up with email or Sign in with Apple, manages kids, tasks, rewards, approves completions, pays for subscription.
- **Kid**: pairs with parent via 6-digit code, no email, no signup. Sees today's tasks, marks them done, sees balance, redeems rewards.

## Tech stack — use latest stable versions

**Mobile (already initialized in `mobile/`):**

- Expo SDK 55 (React Native 0.83, New Architecture mandatory)
- TypeScript strict mode
- expo-router (file-based routing)
- @clerk/clerk-expo for parent auth
- expo-secure-store for kid JWT
- nativewind v4 (Tailwind for React Native)
- @tanstack/react-query v5
- zustand (minimal local state only)
- react-native-reanimated v3
- @shopify/flash-list v2
- expo-haptics, expo-notifications, expo-localization
- zod (shared with backend via `@kroni/shared`)
- lucide-react-native (icons)
- i18n-js

**Backend (you will create in `backend/`):**

- Node.js 22 LTS
- Fastify 5.8.x
- TypeScript strict mode
- Drizzle ORM + drizzle-kit (latest)
- `postgres` driver (not `pg`)
- ioredis
- @clerk/backend for JWT verification
- @fastify/cors, @fastify/helmet, @fastify/rate-limit, @fastify/sensible
- fastify-type-provider-zod
- expo-server-sdk for push notifications
- BullMQ for background jobs
- pino for logging
- bcrypt for kid PIN hashing
- npm (not pnpm/yarn)
- PM2 for process management

**Website (already initialized in `website/`):**

- Next.js 15 (App Router)
- TypeScript strict mode
- Tailwind CSS

**Database/infra (production target, do not provision — only emit configs):**

- PostgreSQL 17
- Redis 7.4
- Ubuntu 24.04 LTS bare metal
- Caddy 2 (TLS + reverse proxy)
- Deployed via `git pull` on server, no CI

## Phase 0 — Workspace and tooling foundation

Execute in order. Use the user's shell (Windows). Use forward slashes in paths inside config files; cmd-line commands should be Windows-compatible.

1. From `C:\Users\nileri\Koding\Kroni`, initialize git:
   ```
   git init
   git branch -m main
   ```

2. Create the root `package.json`:
   ```json
   {
     "name": "kroni",
     "private": true,
     "version": "0.1.0",
     "workspaces": ["mobile", "website", "backend", "shared"],
     "scripts": {
       "dev:mobile": "npm --workspace=mobile run start",
       "dev:website": "npm --workspace=website run dev",
       "dev:backend": "npm --workspace=backend run dev",
       "build:backend": "npm --workspace=backend run build",
       "build:website": "npm --workspace=website run build",
       "lint": "npm --workspaces --if-present run lint",
       "typecheck": "npm --workspaces --if-present run typecheck"
     }
   }
   ```

3. Create root `.gitignore`:
   ```
   node_modules/
   .env
   .env.local
   .env.*.local
   dist/
   build/
   .next/
   .expo/
   .expo-shared/
   ios/
   android/
   *.log
   .DS_Store
   .turbo/
   coverage/
   *.tsbuildinfo
   ```

4. Create `README.md` at the root with project overview, setup steps, and a link to this build spec.

5. Create the `shared/` workspace:
   ```
   mkdir shared
   cd shared
   ```
   - `package.json` named `@kroni/shared`, type `module`, with `zod` as dependency, `typescript` as dev dependency, and exports for ESM
   - `tsconfig.json` extending a strict base config
   - `src/index.ts` re-exporting everything from `src/schemas/`
   - Empty schema files: `parent.ts`, `kid.ts`, `pairing.ts`, `task.ts`, `reward.ts`, `common.ts`
   - Add a build script (`tsc`) so backend can consume compiled output

6. Create the `backend/` workspace:
   ```
   mkdir backend
   cd backend
   ```
   - `package.json` named `@kroni/backend`, with all backend dependencies listed above, `type: module`, scripts for `dev` (tsx watch), `build` (tsc), `start`, `db:generate`, `db:migrate`, `db:studio`, `typecheck`, `test` (node --test)
   - `tsconfig.json` strict, target ES2022, module NodeNext, outputs to `dist/`
   - Place all source under `src/`. Folder layout exactly as in the structure section below.
   - `drizzle.config.ts` at backend root.
   - `ecosystem.config.js` at backend root for PM2.
   - Add `@kroni/shared` as a workspace dependency (`"@kroni/shared": "*"` in dependencies).

7. From the repo root, run `npm install` to wire workspaces.

8. Run `git add . && git commit -m "chore: monorepo workspace foundation"`.

## Phase 1 — Mobile workspace conformance

The Expo template was created standalone. You must integrate it with the workspace and configure the design system tooling.

1. **Verify SDK 55.** Run `npx expo install expo@latest` and `npx expo install --fix` from `mobile/`. If template is older, this aligns it.

2. **Install runtime deps** from `mobile/`. Use `npx expo install` for native modules and `npm install` for pure JS:
   ```
   npx expo install nativewind tailwindcss react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context expo-secure-store expo-haptics expo-notifications expo-localization expo-font expo-constants @shopify/flash-list expo-router
   npm install @clerk/clerk-expo @tanstack/react-query zustand zod i18n-js lucide-react-native
   npm install --save-dev @types/i18n-js
   ```
   Add `@kroni/shared` as a workspace dependency in `mobile/package.json`.

3. **Configure NativeWind v4.** Follow NativeWind v4 install steps exactly: create `tailwind.config.js`, `global.css` (with `@tailwind` directives), update `babel.config.js` to use `nativewind/babel` preset, and create `nativewind-env.d.ts` for TypeScript.

4. **Fix Metro for monorepo (Windows-compatible).** Create `mobile/metro.config.js`:
   ```js
   const { getDefaultConfig } = require('expo/metro-config');
   const path = require('path');

   const projectRoot = __dirname;
   const workspaceRoot = path.resolve(projectRoot, '..');

   const config = getDefaultConfig(projectRoot);
   config.watchFolders = [workspaceRoot];
   config.resolver.nodeModulesPaths = [
     path.resolve(projectRoot, 'node_modules'),
     path.resolve(workspaceRoot, 'node_modules'),
   ];
   config.resolver.disableHierarchicalLookup = true;

   module.exports = config;
   ```

5. **Drop in design tokens** in `tailwind.config.js`. Use the exact color values listed in the design system section below.

6. **Set up `app.config.ts`** (replace `app.json`). Read `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from `process.env`. Preserve the EAS project id `0c4171da-0dac-4d60-91b4-dd3fbf8101d8` already linked.

7. **Wipe template demo content** in `app/`. Replace with a placeholder root `_layout.tsx` (with `<ClerkProvider>`, query client, theme, i18n) and an empty `index.tsx` that renders nothing. You will fill these later.

8. Commit: `git commit -am "chore(mobile): workspace integration + nativewind + theme"`.

## Phase 2 — Shared Zod schemas

Implement the contracts both mobile and backend depend on. Every API request body, response shape, and stored entity has a Zod schema in `@kroni/shared`. Backend uses `fastify-type-provider-zod` so route schemas come directly from these. Mobile uses them for typed API client + form validation.

Required schema modules in `shared/src/schemas/`:

- `common.ts` — branded types: `UUID`, `IsoTimestamp`, `Cents` (positive integer), `SignedCents` (any integer), `Locale` (`nb-NO` | `sv-SE` | `da-DK` | `en-US`), `SubscriptionTier` (`free` | `family` | `premium`)
- `parent.ts` — `ParentSchema`, `UpdateParentSchema`
- `kid.ts` — `KidSchema`, `CreateKidSchema`, `UpdateKidSchema` (birthYear optional, avatarKey one of fixed list of 12 keys, optional 4-digit pin)
- `pairing.ts` — `GeneratePairingCodeResponseSchema` (`{ code: string, expiresAt: IsoTimestamp }`), `PairRequestSchema` (`{ code, name, birthYear?, deviceId }`), `PairResponseSchema` (`{ token, kid }`)
- `task.ts` — `TaskSchema`, `CreateTaskSchema`, `UpdateTaskSchema`, `RecurrenceSchema` (`'daily' | 'weekly' | 'once'`), `TaskCompletionSchema`, `TodayTaskSchema` (computed shape with status: `pending | completed_pending_approval | approved | rejected`)
- `reward.ts` — `RewardSchema`, `CreateRewardSchema`, `UpdateRewardSchema`, `RewardRedemptionSchema`
- `balance.ts` — `BalanceEntrySchema`, `BalanceSummarySchema` (`{ balanceCents, weekEarnedCents, weekSpentCents }`)
- `errors.ts` — `ProblemDetailSchema` (RFC 7807 shape)

Use `z.infer<typeof X>` to derive types and re-export them. Every external boundary value (request body, response, env var) is parsed with a schema, never `as`-cast.

Build the package (`tsc`). Commit: `feat(shared): zod schemas for all entities`.

## Phase 3 — Backend foundation

Create `backend/src/` with this layout:

```
backend/src/
├── server.ts                 # bootstrap: build Fastify app, register plugins, listen
├── app.ts                    # buildApp(): exported for tests + server
├── config.ts                 # zod-validated env loader
├── db/
│   ├── index.ts              # postgres + drizzle init
│   ├── relations.ts          # drizzle relations()
│   └── schema/
│       ├── index.ts
│       ├── parents.ts
│       ├── kids.ts
│       ├── pairing.ts
│       ├── tasks.ts
│       ├── balance.ts
│       └── rewards.ts
├── plugins/
│   ├── auth-clerk.ts         # requireParent decorator
│   ├── auth-kid.ts           # requireKid decorator
│   ├── error-handler.ts      # RFC 7807 mapping
│   └── rate-limit.ts         # @fastify/rate-limit + Redis store
├── routes/
│   ├── public/
│   │   ├── health.ts
│   │   └── pair.ts
│   ├── webhooks/
│   │   └── clerk.ts
│   ├── parent/
│   │   ├── me.ts
│   │   ├── kids.ts
│   │   ├── pairing.ts
│   │   ├── tasks.ts
│   │   ├── rewards.ts
│   │   ├── approvals.ts
│   │   ├── balance.ts
│   │   └── billing.ts
│   └── kid/
│       ├── me.ts
│       ├── today.ts
│       ├── tasks.ts
│       ├── balance.ts
│       ├── rewards.ts
│       └── device.ts
├── services/
│   ├── pairing.service.ts
│   ├── balance.service.ts
│   ├── tasks.service.ts
│   ├── rewards.service.ts
│   ├── notification.service.ts
│   └── billing.service.ts
├── jobs/
│   ├── runner.ts             # standalone PM2 entrypoint
│   ├── daily-reset.ts
│   ├── weekly-allowance.ts
│   ├── approval-reminders.ts
│   └── cleanup.ts
├── lib/
│   ├── jwt.ts
│   ├── codes.ts              # 6-digit code generation
│   ├── time.ts               # Oslo timezone helpers
│   ├── idempotency.ts
│   └── logger.ts
└── tests/
    ├── helpers/              # test db, fixtures
    └── *.test.ts
```

Implement:

1. **`config.ts`** — load env vars via Zod schema (see env vars section). Fail fast on missing.

2. **`app.ts`** — exports `buildApp(opts?)` returning a Fastify instance with: zod type provider, error handler, helmet, cors (allow `https://kroni.no`, `http://localhost:*` in dev), rate limit (Redis store), all routes registered. `server.ts` calls `buildApp()` and `listen()`.

3. **Drizzle schema files** — exact contents in the database section below. Use `casing: 'snake_case'`.

4. **`drizzle.config.ts`** — points at `src/db/schema/*.ts`, output `drizzle/`, dialect postgresql, snake_case casing.

5. **Run `npm run db:generate`** to produce the initial SQL migration. Commit the SQL file.

6. **Auth plugins.** `requireParent` reads `Authorization: Bearer <clerk-jwt>`, verifies via `@clerk/backend` `verifyToken` (env `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY`), looks up the `parents` row by `clerkUserId`, attaches to `request.parent`. `requireKid` verifies HS256 with `KID_JWT_SECRET`, payload shape `{ sub, kind: 'kid', parent_id, device_id }`, loads kid row, attaches to `request.kid`. Both fail with 401 + problem-detail if invalid.

7. **Error handler.** Maps known errors to RFC 7807 JSON: `{ type, title, status, detail, instance }`. Known error classes (export from `lib/errors.ts`): `NotFoundError`, `ConflictError`, `RateLimitError`, `PaymentRequiredError`, `ForbiddenError`, `ValidationError` (delegates to zod issues). Unknown errors → 500 with generic message; full error logged via pino.

8. **Health route** — `GET /api/public/health` returns `{ status: 'ok', uptime, version }`. Use this to verify the server boots.

9. **Test infrastructure** — `tests/helpers/db.ts` spins up a Postgres test schema (use `postgres`'s schema-per-test pattern, or wrap each test in a transaction that rolls back). Expose `withApp(testFn)` that builds the app, runs the test, tears down.

10. **Smoke test** — boot the app in a test, hit `/api/public/health`, assert 200.

Commit: `feat(backend): foundation with drizzle, auth plugins, error handler`.

## Database schema (Drizzle, full implementations)

Drizzle is the only DB layer. **Do not write raw SQL anywhere** except inside Drizzle index `where()` clauses or the auto-generated migration files in `backend/drizzle/`. All money fields are `integer` cents (øre). All ids are `uuid` `defaultRandom()`. All timestamps `withTimezone: true`.

### `backend/src/db/schema/parents.ts`

```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const parents = pgTable('parents', {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text().unique().notNull(),
  email: text().notNull(),
  displayName: text(),
  locale: text().notNull().default('nb-NO'),
  subscriptionTier: text().notNull().default('free'),
  subscriptionExpiresAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;
```

### `backend/src/db/schema/kids.ts`

```typescript
import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents';

export const kids = pgTable(
  'kids',
  {
    id: uuid().primaryKey().defaultRandom(),
    parentId: uuid().notNull().references(() => parents.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    birthYear: integer(),
    avatarKey: text(),
    pin: text(),
    weeklyAllowanceCents: integer().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_kids_parent').on(t.parentId)],
);

export type Kid = typeof kids.$inferSelect;
export type NewKid = typeof kids.$inferInsert;
```

### `backend/src/db/schema/pairing.ts`

```typescript
import { pgTable, uuid, char, text, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { parents } from './parents';
import { kids } from './kids';

export const pairingCodes = pgTable(
  'pairing_codes',
  {
    code: char({ length: 6 }).primaryKey(),
    parentId: uuid().notNull().references(() => parents.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    usedByKidId: uuid().references(() => kids.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_pairing_expires').on(t.expiresAt).where(sql`${t.usedAt} IS NULL`),
  ],
);

export const kidDevices = pgTable(
  'kid_devices',
  {
    id: uuid().primaryKey().defaultRandom(),
    kidId: uuid().notNull().references(() => kids.id, { onDelete: 'cascade' }),
    deviceId: text().notNull(),
    pushToken: text(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_kid_device').on(t.kidId, t.deviceId)],
);

export type PairingCode = typeof pairingCodes.$inferSelect;
export type KidDevice = typeof kidDevices.$inferSelect;
```

### `backend/src/db/schema/tasks.ts`

```typescript
import {
  pgTable, uuid, text, integer, boolean, date, timestamp, index, unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { parents } from './parents';
import { kids } from './kids';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),
    parentId: uuid().notNull().references(() => parents.id, { onDelete: 'cascade' }),
    kidId: uuid().references(() => kids.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    description: text(),
    icon: text(),
    rewardCents: integer().notNull(),
    recurrence: text().notNull(),
    daysOfWeek: integer().array(),
    requiresApproval: boolean().notNull().default(true),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_tasks_kid_active').on(t.kidId, t.active).where(sql`${t.active} = true`),
  ],
);

export const taskCompletions = pgTable(
  'task_completions',
  {
    id: uuid().primaryKey().defaultRandom(),
    taskId: uuid().notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    kidId: uuid().notNull().references(() => kids.id, { onDelete: 'cascade' }),
    scheduledFor: date().notNull(),
    completedAt: timestamp({ withTimezone: true }),
    approvedAt: timestamp({ withTimezone: true }),
    approvedBy: uuid().references(() => parents.id),
    rejectedAt: timestamp({ withTimezone: true }),
    rewardCents: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('uq_completion_per_day').on(t.taskId, t.kidId, t.scheduledFor),
    index('idx_completions_kid_date').on(t.kidId, t.scheduledFor.desc()),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
```

### `backend/src/db/schema/balance.ts`

```typescript
import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { parents } from './parents';
import { kids } from './kids';

export const balanceEntries = pgTable(
  'balance_entries',
  {
    id: uuid().primaryKey().defaultRandom(),
    kidId: uuid().notNull().references(() => kids.id, { onDelete: 'cascade' }),
    amountCents: integer().notNull(),
    reason: text().notNull(),
    referenceId: uuid(),
    note: text(),
    createdBy: uuid().references(() => parents.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_balance_kid_time').on(t.kidId, t.createdAt.desc())],
);

export const kidBalances = pgTable('kid_balances', {
  kidId: uuid().primaryKey().references(() => kids.id, { onDelete: 'cascade' }),
  balanceCents: integer().notNull().default(0),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type BalanceEntry = typeof balanceEntries.$inferSelect;
export type KidBalance = typeof kidBalances.$inferSelect;
```

### `backend/src/db/schema/rewards.ts`

```typescript
import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { parents } from './parents';
import { kids } from './kids';

export const rewards = pgTable('rewards', {
  id: uuid().primaryKey().defaultRandom(),
  parentId: uuid().notNull().references(() => parents.id, { onDelete: 'cascade' }),
  kidId: uuid().references(() => kids.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  icon: text(),
  costCents: integer().notNull(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const rewardRedemptions = pgTable('reward_redemptions', {
  id: uuid().primaryKey().defaultRandom(),
  rewardId: uuid().notNull().references(() => rewards.id, { onDelete: 'cascade' }),
  kidId: uuid().notNull().references(() => kids.id, { onDelete: 'cascade' }),
  costCents: integer().notNull(),
  requestedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp({ withTimezone: true }),
  fulfilledAt: timestamp({ withTimezone: true }),
  rejectedAt: timestamp({ withTimezone: true }),
  parentNote: text(),
});

export type Reward = typeof rewards.$inferSelect;
export type NewReward = typeof rewards.$inferInsert;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
```

### `backend/src/db/schema/index.ts`

Re-export everything. Define `relations()` in `relations.ts` covering parents↔kids, kids↔balance, kids↔completions, tasks↔completions, rewards↔redemptions.

### Querying rules

- All queries through `db` from `backend/src/db/index.ts`.
- Builder API only (`db.select()`, `db.insert()`, etc.) and `db.query.*` for nested reads.
- Atomic operations use `db.transaction()`.
- The only acceptable use of `sql` template tag is inside index `where` predicates or for narrow cases the builder cannot express (e.g. `ON CONFLICT DO UPDATE` upserts).
- All row types via `$inferSelect` / `$inferInsert`. Never hand-write row types.
- **Never use `drizzle-kit push` against production.** Migrations only.
- **Never edit applied migration files.** Change schema and regenerate.

## Phase 4 — Pairing flow (the first real feature)

Implement, end-to-end, with tests.

**Backend:**

- `POST /api/parent/pairing-code` (`requireParent`): generate 6 random digits via crypto.randomInt, retry up to 5 times if collision with active code. Insert `pairingCodes` row with `expiresAt = now() + 15 min`. Cache `pair:{code}` in Redis → `parentId`, TTL 900. Return `{ code, expiresAt }`.
- `POST /api/public/pair` (no auth): rate limit 5/IP/hour and 10/deviceId/day via Redis. Look up code in Redis, fall back to DB. If invalid/expired/used → 401, increment failure counter. In one Drizzle transaction: insert `kids`, mark `pairingCodes.usedAt + usedByKidId`, insert `kidDevices`, insert `kidBalances` row at 0. Sign JWT (HS256, exp 90 days). Return `{ token, kid }`.
- Token refresh: middleware extends `exp` if remaining < 30 days, returns new token in `X-Token-Refresh` header.

**Tests (`backend/tests/pairing.test.ts`):**

- Happy path: generate code as parent, redeem as kid, kid row created, balance row created, code marked used.
- Expired code → 401.
- Already-used code → 401.
- Collision retry: stub `randomInt` to return same value twice, verify retry path.
- Rate limit: 6th attempt from same IP within an hour → 429.
- Token refresh: token with 29 days left → new token issued.

Commit: `feat(backend): pairing flow with rate limiting and tests`.

## Phase 5 — Parent CRUD (kids, tasks, rewards) + Clerk webhook

- `parents` row sync: webhook `POST /api/webhooks/clerk` verifies signature with svix (env `CLERK_WEBHOOK_SECRET`), handles `user.created`, `user.updated`, `user.deleted`. Upserts `parents` row keyed on `clerkUserId`. Soft-handle `user.deleted` (cascade deletes via FK).
- All parent routes from the route inventory below. Validate inputs with shared Zod schemas. Use Drizzle for all queries.
- Subscription gating enforced server-side: `free` tier caps at 1 kid and 5 active tasks. Over-limit → 402 with problem-detail. Express limits as a service helper that all create-routes call.

Tests: parent flows hitting their own resources only (RLS-style: never let parent A see parent B's data). Verify cascade deletes.

Commit: `feat(backend): parent CRUD + clerk webhook + subscription gating`.

## Phase 6 — Tasks, completions, ledger, approvals

This is the money path. Get it right.

- `GET /api/kid/today` — idempotently generates `taskCompletions` rows for today (Oslo time) for the kid's active tasks where today's day-of-week matches. Don't pre-generate the week; on-demand.
- `POST /api/kid/tasks/:completionId/complete` — requires `Idempotency-Key` header (UUID). Cache key in Redis 24h with response. If task `requiresApproval = true`: set `completedAt`, return pending state. If false: same transaction inserts `balanceEntries` (positive `rewardCents`, reason `'task'`, reference `completionId`), updates `kidBalances`, sets `approvedAt`.
- `POST /api/parent/approvals/tasks/:completionId/approve` — transaction: set `approvedAt + approvedBy`, insert balance entry, update `kidBalances`. Idempotent (re-approving same completion is a no-op).
- `POST /api/parent/approvals/tasks/:completionId/reject` — set `rejectedAt`, no balance change.
- **Recompute helper** (`balance.service.ts`): given a kidId, sum all `balanceEntries.amountCents` and assert equals `kidBalances.balanceCents`. Expose as `GET /api/parent/kids/:id/balance/verify` for admin/debug. Used in tests.

**Tests (`backend/tests/balance.test.ts`):**

- Approve task with `requiresApproval=true` → balance increases.
- Complete task with `requiresApproval=false` → balance increases immediately.
- Double-tap with same idempotency key → balance increases once.
- Recompute matches materialized balance after 100 random ops.
- Reject after approve → fail (cannot reject approved completion).
- Approve twice → no-op (idempotent).

Commit: `feat(backend): tasks, completions, ledger, approvals with money-path tests`.

## Phase 7 — Rewards and redemptions

- Parent CRUD on rewards.
- `POST /api/kid/rewards/:id/redeem` — check `kidBalances.balanceCents >= reward.costCents` (block at request time). Insert `rewardRedemptions` row in `requested` state. No balance change yet.
- `POST /api/parent/approvals/rewards/:redemptionId/approve` — transaction: re-check balance (race: kid requested 2 rewards back-to-back), if insufficient → 409 conflict. Insert negative `balanceEntries`, update `kidBalances`, set `approvedAt + fulfilledAt`.
- `POST /api/parent/approvals/rewards/:redemptionId/reject` — set `rejectedAt`, optional `parentNote`.
- **No-go-negative test:** kid has 100, redeems two 80-kr rewards in succession; first approval succeeds (balance 20), second approval fails with 409.

Commit: `feat(backend): rewards and redemptions with no-negative invariant`.

## Phase 8 — Background jobs

`backend/src/jobs/runner.ts` is a separate entrypoint, NOT part of the API process. It boots BullMQ workers + node-cron schedules. Single-instance via PM2.

- **Daily reset (cron `5 0 * * *` Oslo):** for each parent's active kids, generate today's `taskCompletions` rows. Send Expo push to kids who got new tasks ("Hei {{name}}, du har {{count}} oppgaver i dag"). Wrap in BullMQ job with retry.
- **Weekly allowance (cron `0 8 * * 1` Oslo):** for kids with `weeklyAllowanceCents > 0`, insert balance entry, update `kidBalances`. Push to kid: "Ukepenger på {{amount}} kr er klare! 💰".
- **Approval reminder (cron `*/30 * * * *`):** parents with > 0 pending approvals older than 2h get a push. Track in Redis `reminder:sent:{parentId}:{date}` to enforce max once per day.
- **Cleanup (cron `0 * * * *`):** delete unused expired `pairingCodes` (where `expiresAt < now() - 1h AND usedAt IS NULL`); archive completed/approved `taskCompletions` older than 90 days to a `task_completions_archive` table.

Use `Europe/Oslo` timezone for all crons (luxon or date-fns-tz).

Tests: time-travel using fake timers, verify daily-reset generates correct rows.

Commit: `feat(backend): background jobs (daily reset, allowance, reminders, cleanup)`.

## Phase 9 — Mobile foundation

In `mobile/`:

1. **Theme module** `lib/theme.ts` — exports color tokens, typography scale, spacing, radii. NativeWind config consumes these.

2. **i18n setup** `lib/i18n/` — `i18n-js` initialized with `nb`, `sv`, `da`, `en`. Default `nb-NO`. Use `expo-localization` to detect device locale; fallback to `nb` if device is Scandinavian, `en` otherwise.

3. **API client** `lib/api.ts` — typed wrapper around `fetch`. Reads `EXPO_PUBLIC_API_URL` from `expo-constants`. Two flavors: `parentApi` (uses Clerk session token via `useAuth().getToken()`) and `kidApi` (uses kid JWT from secure-store). Each method validates response with the corresponding `@kroni/shared` schema. Responds to 401 by clearing auth and routing to sign-in / pair screen.

4. **Auth state** `lib/auth.ts` — kid token stored in `expo-secure-store` under key `kroni.kidToken`. Helpers: `setKidToken`, `getKidToken`, `clearKidToken`. Parent auth handled by Clerk.

5. **Root layout** `app/_layout.tsx` — `<ClerkProvider>` wrapping `<QueryClientProvider>` wrapping `<I18nProvider>` wrapping `<Stack>`. Loads fonts. Hides splash when ready.

6. **Role chooser** `app/index.tsx` — first-launch screen. Two big cards. Stores choice in secure-store. Routes to parent sign-in or kid pair screen.

7. **UI primitives** in `components/ui/`: `Button`, `Card`, `Input`, `Label`, `Badge`, `Avatar`, `Modal`, `Sheet`, `ProgressRing`, `BalanceText`, `EmptyState`, `Spinner`. All use NativeWind classes. All support light + dark modes. Touch targets ≥44pt parent / ≥56pt kid.

Commit: `feat(mobile): foundation (theme, i18n, api client, role chooser, primitives)`.

## Phase 10 — Mobile parent flow

Build out every parent screen listed in the screens section below. Wire to backend via `parentApi`. Use react-query for all server state (queries, mutations with optimistic updates where it makes sense — task completion on parent side does NOT need optimism, but adding/editing tasks does).

Forms use `react-hook-form` with Zod resolvers from `@kroni/shared`.

Pairing-code screen: large monospace `### ###` display, 15:00 countdown, copy-to-clipboard button, regenerate button, Norwegian instruction text below.

Approvals queue: pending approvals split into two sections, swipe gestures via `react-native-gesture-handler`, haptic on action, optimistic UI removal.

Norwegian copy throughout, every string in `lib/i18n/nb.json`. Mark any auto-generated string with `// [REVIEW]` comment.

Commit: `feat(mobile): parent flows`.

## Phase 11 — Mobile kid flow

The kid experience is the heart of the product. Spend extra polish here.

- **Pair screen**: 6 segmented input boxes auto-advancing on digit, paste support, friendly error states, big `Koble til` button.
- **Today**: `today.tsx` — top-of-screen greeting + balance in giant gold (`gold-500`) numerals. Tasks as 120pt-tall cards. Tap → spring animation (Reanimated worklet, scale 1 → 0.95 → 1.05 → 1.0), light haptic, "Bra jobba!" overlay (250ms), card animates to "Ferdig"-section. If `requiresApproval`: card shows a "Venter på godkjenning"-state with a subtle pulse. Pull-to-refresh. ProgressRing at bottom showing % done today.
- **Celebrate**: full-screen modal triggered by push notification handler when parent approves a task while kid has app open. Confetti via Reanimated, big bouncing coin SVG, "Du fikk +{{amount}} kr!", balance count-up animation, dismissable.
- **Balance**: huge balance number, history list with FlashList, relative dates ("i dag", "i går", "for 2 dager siden"), reason icons.
- **Rewards**: 2-column grid. Affordable rewards bright with `gold-500` accent; unaffordable faded with "Trenger {{n}} kr til" overlay. Tap affordable → confirmation modal → submit. After redemption: card shows "Venter på godkjenning"-state.
- **Profile**: avatar, name, 7-day mini bar chart of earnings, sign-out (with warning).

All animations on UI thread via Reanimated worklets. All actions trigger appropriate haptics. Empty states have warm Norwegian copy + a mascot SVG.

Push notification handler at root layout: when `kroni.taskApproved` data payload received and app is foregrounded → route kid to `celebrate.tsx` with the amount.

Commit: `feat(mobile): kid flow with celebrations and animations`.

## Phase 12 — Subscription gating + paywall

- Backend already enforces (Phase 5). Mobile must show paywall when 402 response received.
- Integrate **RevenueCat** (`react-native-purchases`). Configure SKUs: `family_monthly` (49 NOK) and `family_yearly` (399 NOK). Yearly highlighted "Spar 32%".
- Paywall screen `(parent)/paywall.tsx`: tier comparison, monthly/yearly toggle, legal disclosure (auto-renew terms — required by Apple), `Restore purchases` button, link to terms + privacy on `kroni.no`.
- On successful purchase: RevenueCat webhook → backend updates `parents.subscriptionTier` + `subscriptionExpiresAt`. Mobile invalidates billing query.

Commit: `feat: subscription gating with revenuecat paywall`.

## Phase 13 — Website (marketing + legal)

Minimal first pass in `website/`:

- **Landing page** (`/`): hero in Norwegian, 3-feature explainer (Oppgaver / Belønninger / Ukepenger), screenshots placeholder, CTA "Last ned" with App Store + Play Store badges (placeholder links), footer with links to privacy + terms + support.
- **Privacy policy** (`/personvern`): GDPR-compliant, drafted in Norwegian. Cover what data is collected (parent email, kid first name + birth year + avatar key + device ID + push token), why, retention, deletion rights, contact info. Mark as `[REVIEW BY LAWYER]` at top.
- **Terms of service** (`/vilkar`): basic SaaS terms in Norwegian, include subscription auto-renew language. Mark `[REVIEW BY LAWYER]`.
- **Support** (`/support`): contact email `support@kroni.no`, FAQ with 8-10 common questions (in Norwegian).
- All pages use Tailwind, match the design system colors. Dark mode supported via `prefers-color-scheme`. Norwegian copy throughout, English fallback at `/en/...`.

Static export-friendly (no server routes needed for v1). Commit: `feat(website): landing + legal pages in Norwegian`.

## Phase 14 — Polish, deployment configs, final checks

1. **Empty / loading / error states** for every mobile screen. No blank screens, no raw error messages to user.
2. **Accessibility**: every interactive element has `accessibilityLabel` (Norwegian). Tested with screen reader on at least the kid Today screen.
3. **Dark mode**: every screen verified manually (use `useColorScheme` toggle in dev menu).
4. **Haptics**: every meaningful action has appropriate feedback via `expo-haptics`.
5. **PM2 ecosystem.config.js** at `backend/`:

   ```js
   module.exports = {
     apps: [
       {
         name: 'kroni-api',
         script: 'dist/server.js',
         cwd: '/srv/kroni/backend',
         instances: 'max',
         exec_mode: 'cluster',
         node_args: '--enable-source-maps',
         env: { NODE_ENV: 'production' },
         max_memory_restart: '500M',
         time: true,
       },
       {
         name: 'kroni-jobs',
         script: 'dist/jobs/runner.js',
         cwd: '/srv/kroni/backend',
         instances: 1,
         exec_mode: 'fork',
         env: { NODE_ENV: 'production' },
         max_memory_restart: '300M',
         time: true,
       },
     ],
   };
   ```

6. **Caddyfile** committed at repo root as `Caddyfile.example`:

   ```
   api.kroni.no {
       reverse_proxy localhost:3000
       encode gzip zstd
       header {
           Strict-Transport-Security "max-age=31536000;"
           X-Content-Type-Options "nosniff"
           X-Frame-Options "DENY"
           Referrer-Policy "no-referrer"
       }
   }

   kroni.no, www.kroni.no {
       reverse_proxy localhost:3001
       encode gzip zstd
   }
   ```

7. **Deploy script** `deploy.sh` at repo root:

   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   cd /srv/kroni
   git fetch origin
   git reset --hard origin/main
   npm ci
   npm --workspace=@kroni/shared run build
   npm --workspace=@kroni/backend run build
   npm --workspace=@kroni/backend run db:migrate
   npm --workspace=website run build
   pm2 reload kroni-api --update-env
   pm2 reload kroni-jobs --update-env
   echo "✓ Deployed $(git rev-parse --short HEAD)"
   ```

8. **Server setup README** at `docs/SERVER-SETUP.md` documenting Ubuntu 24.04 install steps for Postgres 17, Redis 7.4, Caddy, Node 22, PM2 — with copy-paste commands.

9. **Run typecheck across all workspaces** (`npm run typecheck`). Fix any errors. Commit if clean.

Final commit: `chore: deployment configs, docs, polish pass`.

## Environment variables

Backend `.env` (validate via Zod in `config.ts`, fail fast on missing):

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://kroni:PW@localhost:5432/kroni_prod
REDIS_URL=redis://:PW@localhost:6379
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
KID_JWT_SECRET=<openssl rand -hex 32>
EXPO_ACCESS_TOKEN=...
APP_TIMEZONE=Europe/Oslo
```

Mobile `app.config.ts` reads from `process.env`:

```
EXPO_PUBLIC_API_URL=https://api.kroni.no
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Provide `.env.example` files at `backend/.env.example` and `mobile/.env.example` listing variable names with placeholder values.

## Backend route inventory

All routes prefixed `/api`. All inputs/outputs validated with Zod schemas from `@kroni/shared`.

**Public:**

- `POST /api/public/pair`
- `GET  /api/public/health`
- `POST /api/webhooks/clerk`

**Parent (`requireParent`):**

- `GET    /api/parent/me`
- `PATCH  /api/parent/me`
- `GET    /api/parent/kids`
- `POST   /api/parent/kids`
- `GET    /api/parent/kids/:id`
- `PATCH  /api/parent/kids/:id`
- `DELETE /api/parent/kids/:id`
- `POST   /api/parent/pairing-code`
- `GET    /api/parent/tasks`
- `POST   /api/parent/tasks`
- `PATCH  /api/parent/tasks/:id`
- `DELETE /api/parent/tasks/:id`
- `GET    /api/parent/approvals`
- `POST   /api/parent/approvals/tasks/:completionId/approve`
- `POST   /api/parent/approvals/tasks/:completionId/reject`
- `POST   /api/parent/approvals/rewards/:redemptionId/approve`
- `POST   /api/parent/approvals/rewards/:redemptionId/reject`
- `GET    /api/parent/rewards`
- `POST   /api/parent/rewards`
- `PATCH  /api/parent/rewards/:id`
- `DELETE /api/parent/rewards/:id`
- `POST   /api/parent/balance/adjust`
- `GET    /api/parent/billing/status`
- `POST   /api/parent/billing/verify-receipt`

**Kid (`requireKid`):**

- `GET  /api/kid/me`
- `GET  /api/kid/today`
- `POST /api/kid/tasks/:completionId/complete`
- `GET  /api/kid/balance`
- `GET  /api/kid/history`
- `GET  /api/kid/rewards`
- `POST /api/kid/rewards/:id/redeem`
- `POST /api/kid/device`

## Critical business rules

1. **Money math is integer øre.** Never use floats. Display formatting only at the UI boundary via `Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' })`.
2. **Ledger is append-only.** No `UPDATE` or `DELETE` on `balanceEntries`. To reverse a credit, insert a negative entry. Update `kidBalances` in the SAME Drizzle transaction as every ledger insert.
3. **Task completion idempotency** via `Idempotency-Key` header (Redis cache, 24h).
4. **Approval workflow:** `requiresApproval=false` → immediate credit. `requiresApproval=true` → completion creates row, parent approves, approval triggers ledger entry. Reward redemption is always two-step.
5. **No-go-negative invariant** on rewards. Check at request and approval.
6. **Today's tasks generated on demand** in `GET /api/kid/today`. Background job pre-generates next day for performance, but on-demand path is source of truth.
7. **Subscription gating server-side.** `free`: 1 kid + 5 active tasks. Over → 402.
8. **Pairing codes**: 15-min single-use, aggressive rate limits.
9. **Cron jobs in separate PM2 fork process**, never in API cluster.

## Mobile design system

**Color tokens** (in `mobile/tailwind.config.js`):

```
gold-50:  #FFF8E6
gold-100: #FFEFC2
gold-300: #FFD263
gold-500: #F5B015   // brand primary
gold-700: #B8800A
gold-900: #6B4806

sand-50:  #FBFAF6   // app bg light
sand-100: #F4F1E8
sand-200: #E8E2D1   // borders
sand-500: #8B8472   // muted text
sand-900: #1F1C14   // primary text light

ink-800:  #1A1F26   // card bg dark
ink-900:  #0E1116   // app bg dark

success: #10B981
warning: #F59E0B
danger:  #EF4444
info:    #3B82F6

coral:   #FB7185   // kid celebration
violet:  #A78BFA
sky:     #38BDF8
```

**Typography:** SF Pro on iOS (system), Inter on Android via `expo-font`. Scale 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48. Weights 400 / 500 / 600 / 700.

**Spacing:** 4-point grid (4, 8, 12, 16, 20, 24, 32, 48, 64).

**Touch targets:** 44pt parent / 56pt kid.

**Corner radii:** sm=8, md=12, lg=16, xl=24, pill=999. Kid task cards `xl`, parent rows `md`, primary CTAs `pill`.

**Elevation:** prefer 1px borders (`sand-200`) over shadows. Sparingly: `y:1, blur:3, opacity:0.05`. Dark mode: no shadows, lighter cards.

**Icons:** Lucide stroke 2, size 20 default / 24 in headers / 16 inline.

**Dark mode:** every screen, day one.

**Motion:** Reanimated 3 worklets, no JS-thread animation. Task tap spring 1 → 0.95 → 1.05 → 1.0. Approval received: full-screen confetti. Balance number changes: animated count-up.

## Mobile screens — full inventory

### Root
- `app/index.tsx` — role chooser

### Parent

- `app/auth/parent-sign-in.tsx`, `app/auth/parent-sign-up.tsx` — Clerk components themed
- `app/(parent)/(tabs)/kids.tsx` — list with progress rings
- `app/(parent)/kids/new.tsx` — create + pairing code
- `app/(parent)/kids/[id].tsx` — kid detail tabs
- `app/(parent)/(tabs)/tasks.tsx` — task list grouped by kid
- `app/(parent)/tasks/new.tsx`, `app/(parent)/tasks/[id].tsx` — task editor
- `app/(parent)/(tabs)/rewards.tsx`, `app/(parent)/rewards/new.tsx`, `app/(parent)/rewards/[id].tsx`
- `app/(parent)/approve.tsx` — pending approvals queue
- `app/(parent)/(tabs)/settings.tsx`
- `app/(parent)/paywall.tsx`

### Kid

- `app/auth/kid-pair.tsx` — 6-digit input
- `app/(kid)/(tabs)/today.tsx`
- `app/(kid)/celebrate.tsx`
- `app/(kid)/(tabs)/balance.tsx`
- `app/(kid)/(tabs)/rewards.tsx`
- `app/(kid)/(tabs)/profile.tsx`

## Internationalization

Default `nb-NO`. Implement `nb`, `sv`, `da`, `en`. Translate all skeleton + key strings into `nb` fully; other locales ship with English fallback initially. Hierarchical keys, `i18n-js` + `expo-localization`. Currency per locale (NOK / SEK / DKK / NOK).

## Testing strategy

- **Backend**: `node:test` runner. Unit tests for services, integration tests for routes via `fastify.inject()`. Real Postgres test DB via Docker (provide `docker-compose.test.yml`). Cover money paths, auth paths, idempotency. Don't chase coverage; cover invariants.
- **Mobile**: skip unit tests v1. Manual TestFlight / Play internal.
- **Website**: skip tests v1.

## Non-negotiables

- **Drizzle is the only DB layer.** No raw SQL except auto-generated migrations + Drizzle index `where()` predicates.
- **Money is integer øre, never float.**
- **Ledger is append-only.**
- **Pairing codes 15 min single-use, aggressively rate-limited.**
- **Idempotency on all kid mutations.**
- **Cron jobs in separate fork process.**
- **Subscription gating server-side.**
- **Sign in with Apple required** (App Store rule when offering social login).
- **Privacy:** birth year only (not DOB); preset avatars only (no uploads).
- **Norwegian copy marked `[REVIEW]`** on every auto-generated string.
- **Don't run `npm audit fix --force`.** Ever.
- **Don't write Windows paths** in deployment configs (server is Ubuntu).
- **Commit after every phase.**

## Order of execution

Execute phases 0 through 14 in order. Each phase must compile, typecheck, and (where applicable) pass tests before moving on. After each phase:

1. `npm run typecheck` from root — must pass with zero errors.
2. For backend phases, `npm --workspace=@kroni/backend run test` — must pass.
3. `git add . && git commit -m "<phase commit message>"` and `git tag phase-N`.

If a phase fails, fix and retry. Do not move on with broken code.

When all phases complete, output a final summary including:

- Total commit count
- Lines of code per workspace
- Test count and pass rate
- Any `[REVIEW]` markers requiring human attention (Norwegian copy + lawyer review)
- Any TODOs or known limitations

Begin with Phase 0. Do not stop or ask for confirmation between phases.
