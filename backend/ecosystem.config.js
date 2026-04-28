// PM2 process map for the Kroni backend.
// Two processes: the API in cluster mode, and the cron/jobs runner as a single fork.
// The fork mode for jobs is non-negotiable — multiple cron schedulers would fire
// duplicate jobs and corrupt the ledger.

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
  ],
};
