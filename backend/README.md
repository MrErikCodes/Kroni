# @kroni/backend

Fastify 5 + Drizzle ORM + PostgreSQL 17 + Redis. Two PM2 processes in production: `kroni-api` (cluster) + `kroni-jobs` (single fork).

## Dev

```bash
cp .env.example .env                # fill keys
npm --workspace=@kroni/shared run build
npm run db:generate                 # produce migration SQL after schema change
npm run db:migrate                  # apply
npm run dev                         # API on :3000 (tsx watch)
npm run dev:jobs                    # cron + queues (separate process)
```

## Layout

```
src/
├── server.ts          bootstrap → buildApp().listen()
├── app.ts             buildApp(opts) — registered for tests + server
├── config.ts          zod-validated env
├── db/                drizzle: schema/, relations.ts, index.ts
├── plugins/           auth-clerk, auth-kid, error-handler, rate-limit
├── routes/            public/, webhooks/, parent/, kid/
├── services/          pairing, balance, tasks, rewards, notification, billing
├── jobs/              runner (PM2 fork) + cron jobs
├── lib/               jwt, codes, time, idempotency, logger, errors
└── tests/             node:test against real Postgres + Redis
```

## Money invariant

`balance_entries` is append-only. Every insert happens in the same `db.transaction()` as a `kid_balances.balanceCents` update. Never use raw SQL except in Drizzle index `where()` predicates and auto-generated migrations.
