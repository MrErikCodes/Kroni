#!/usr/bin/env bash
# Pull, build, migrate, reload. Idempotent. Run on the production server.
set -euo pipefail

cd /srv/kroni

echo "==> fetching latest"
git fetch origin
git reset --hard origin/main

echo "==> npm ci"
npm ci

echo "==> build shared"
npm --workspace=@kroni/shared run build

echo "==> build backend"
npm --workspace=@kroni/backend run build

echo "==> migrate db"
npm --workspace=@kroni/backend run db:migrate

echo "==> build website"
npm --workspace=website run build

echo "==> reload PM2"
pm2 reload kroni-api --update-env
pm2 reload kroni-jobs --update-env
pm2 reload kroni-website --update-env

REV=$(git rev-parse --short HEAD)
echo "✓ Deployed ${REV}"
