// PM2 process map for the Kroni stack — API, jobs, and the marketing website.
//
// - kroni-api      cluster mode, scales across CPU cores. Stateless HTTP.
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
      name: 'kroni-api',
      script: 'dist/server.js',
      cwd: '/srv/kroni/backend',
      instances: 'max',
      exec_mode: 'cluster',
      node_args: '--enable-source-maps',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '500M',
      time: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
    {
      name: 'kroni-jobs',
      script: 'dist/jobs/runner.js',
      cwd: '/srv/kroni/backend',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--enable-source-maps',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '300M',
      time: true,
      kill_timeout: 5000,
    },
    {
      name: 'kroni-website',
      // `npm start` resolves to `phase run "next start"` so Phase secrets get
      // injected into Next at boot — same pattern as backend.
      script: 'npm',
      args: 'start',
      cwd: '/srv/kroni/website',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: '3001' },
      max_memory_restart: '500M',
      time: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
