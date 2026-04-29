// PM2 process map for the Kroni stack — API, jobs, and the marketing website.
//
// All three apps boot via `npm start*` so each command is wrapped in
// `phase run`, which injects Phase secrets (DATABASE_URL, REDIS_URL,
// CLERK_*, MAILPACE_*, etc.) into process.env before Node starts.
//
// - kroni-api      fork mode. Cluster mode requires a direct Node script;
//                  going through `npm` (so Phase can inject secrets) means
//                  fork only. If we ever need multi-core, pre-export secrets
//                  with `phase secrets export` and run `node` directly.
// - kroni-jobs     fork mode (single instance) — cron/job runner. NEVER cluster
//                  this; multiple schedulers would fire duplicate jobs and
//                  corrupt the ledger.
// - kroni-website  fork mode (single instance) — Next.js production server.
//                  Listens on :3001; Caddy reverse-proxies kroni.no/.se/.dk
//                  to it. Single instance is fine — the workload is light and
//                  Next handles its own concurrency.

module.exports = {
  apps: [
    {
      name: "kroni-api",
      script: "npm",
      args: "start",
      cwd: "/root/Kroni/backend",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "500M",
      time: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
    {
      name: "kroni-jobs",
      script: "npm",
      args: "run start:jobs",
      cwd: "/root/Kroni/backend",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "300M",
      time: true,
      kill_timeout: 5000,
    },
    {
      name: "kroni-website",
      // `npm start` resolves to `phase run "next start"` so Phase secrets get
      // injected into Next at boot — same pattern as backend.
      script: "npm",
      args: "start",
      cwd: "/root/Kroni/website",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: "3001" },
      max_memory_restart: "500M",
      time: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
