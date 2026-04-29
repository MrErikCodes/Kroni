# Kroni

Norwegian/Scandinavian allowance and chore-tracking mobile app.

Parents create chore tasks. Kids mark them complete. Parents approve completions. Kids accumulate virtual NOK they redeem for parent-defined rewards. No real money flows — virtual ledger only.

## Workspaces

| Workspace  | Purpose                                                  |
| ---------- | -------------------------------------------------------- |
| `mobile/`  | Expo / React Native app — parent + kid in same binary    |
| `backend/` | Fastify 5 + Drizzle + PostgreSQL 17 + Redis              |
| `website/` | Next.js 15 marketing site + legal pages                  |
| `shared/`  | `@kroni/shared` — Zod schemas + branded types, ESM build |

## Stack

- **Mobile** — Expo SDK 54, React Native 0.81, TypeScript strict, expo-router, NativeWind v4, react-query v5, Reanimated v4, Clerk auth, expo-secure-store kid JWT
- **Backend** — Node 22 LTS, Fastify 5, Drizzle ORM, `postgres` driver, ioredis, Clerk JWT, Expo push, BullMQ, PM2 cluster + fork
- **Website** — Next.js 16, Tailwind v4
- **Infra** — PostgreSQL 17, Redis 7.4, Ubuntu 24.04, Caddy 2

## Setup (developer)

```bash
git clone <repo> && cd kroni
npm install                              # hoists workspaces
cp backend/.env.example backend/.env     # fill keys
npm run build:shared                     # compile @kroni/shared
npm run dev:backend                      # API on :3000
npm run dev:website                      # marketing on :3001
npm run dev:mobile                       # Expo dev server
```

Postgres 17 + Redis 7 must be reachable. See `docs/SERVER-SETUP.md` for production deploy.

## Money invariants

- All amounts stored as integer **øre** (1 NOK = 100 øre). Never floats.
- `balance_entries` is **append-only**. Reverse a credit by inserting a negative entry.
- `kid_balances` (materialized) updates in the same Drizzle transaction as every entry.

## Runbooks

Operational docs live in `docs/`:

- `docs/appstore.md` — App Store + Play Store setup (capabilities, IAP products, sandbox testers).
- `docs/revenuecat.md` — RC dashboard config (entitlement, products, offering, sandbox testing).
- `docs/email.md` — Mailpace transactional email pipeline.
- `docs/webhooks.md` — RevenueCat + Clerk webhook endpoints + auth.
- `docs/universal-links.md` — `apple-app-site-association` + `assetlinks.json` setup.
- `docs/closedbeta.md` — TestFlight + Play internal-testing playbook.
- `docs/testing.md` — local test DB hygiene.
- `docs/SERVER-SETUP.md` — production deploy notes.

`todo.md` at repo root is the running outstanding-work list.

## License

Proprietary. © Nilsen Konsult.
