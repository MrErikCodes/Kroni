# Kroni server setup — Ubuntu 24.04 LTS

One-time bootstrap for a bare-metal/VPS host running both the API and the website. Adjust paths if you split them onto separate hosts.

## 1. System packages

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install build-essential git curl ca-certificates ufw fail2ban unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 2. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 3. Node 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs
node --version    # v22.x
sudo npm i -g pm2
```

## 4. PostgreSQL 17

```bash
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'
sudo apt update && sudo apt -y install postgresql-17

sudo -u postgres psql <<'SQL'
CREATE USER kroni WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE kroni_prod OWNER kroni;
GRANT ALL PRIVILEGES ON DATABASE kroni_prod TO kroni;
SQL
```

Edit `/etc/postgresql/17/main/postgresql.conf`:

```
listen_addresses = 'localhost'
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 16MB
maintenance_work_mem = 256MB
```

Restart: `sudo systemctl restart postgresql@17-main`.

## 5. Redis 7.4

```bash
sudo apt -y install redis-server
sudo sed -i 's/^# requirepass .*/requirepass CHANGE_ME/' /etc/redis/redis.conf
sudo sed -i 's/^supervised .*/supervised systemd/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

## 6. Caddy 2

```bash
sudo apt -y install debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt -y install caddy

# Replace default Caddyfile
sudo cp /root/kroni/Caddyfile.example /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 7. Checkout + first run

> **Note:** running as `root` out of `/root/kroni` for now. Not best practice (a dedicated unprivileged service user is the proper move) but acceptable while bootstrapping. Migrate to a `kroni` user under `/srv/kroni` later — change the `cwd` paths in `backend/ecosystem.config.js`, the path in `deploy.sh`, and re-run `pm2 startup` against the new user.

```bash
# As root
git clone git@github.com:nilsenkonsult/kroni.git /root/kroni
cd /root/kroni

# Phase secrets are fetched at runtime — see step 7a below before building.

# First build + migrate + boot
npm ci
npm --workspace=@kroni/shared run build
npm --workspace=@kroni/backend run build
npm --workspace=@kroni/backend run db:migrate
npm --workspace=website run build

# Start under PM2 + persist across reboot
cd /root/kroni/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
# Run the command pm2 prints at the end of the previous line — it pins
# the PM2 daemon to systemd for the current user.
```

## 7a. Phase secrets

Every npm script wraps `phase run`, so the runtime needs a Phase service token. Generate one in the Phase dashboard scoped to the backend + website apps, then:

```bash
echo 'export PHASE_SERVICE_TOKEN="pss_service:v2:..."' >> /root/.bashrc
source /root/.bashrc
phase --version    # confirm CLI is on PATH

# Required backend secrets (push to Phase, not local .env):
phase secrets update DATABASE_URL --value 'postgres://kroni:<password>@localhost:5432/kroni_prod'
phase secrets update REDIS_URL --value 'redis://:<password>@localhost:6379'
phase secrets update CLERK_SECRET_KEY --value 'sk_live_...'
phase secrets update CLERK_WEBHOOK_SECRET --value 'whsec_...'
phase secrets update KID_JWT_SECRET --value "$(openssl rand -hex 32)"
phase secrets update EXPO_ACCESS_TOKEN --value '...'
phase secrets update MAILPACE_API_TOKEN --value '...'
phase secrets update REVENUECAT_WEBHOOK_AUTH --value "$(openssl rand -hex 32)"
phase secrets update SENTRY_DSN --value 'https://...'
```

If you change `PHASE_SERVICE_TOKEN` after PM2 has booted, run `pm2 reload all --update-env` so the apps pick up the new token.

## 8. Backups

Add a daily logical backup to `/var/backups/kroni`:

```bash
sudo -u postgres pg_dump --format=custom kroni_prod > /var/backups/kroni/$(date +%F).pgdump
```

Wrap in `/etc/cron.daily/kroni-pgdump` and ship to off-host storage.

## 9. Monitoring

`pm2 monit` for live logs. `pm2 logs kroni-api`. Tail Caddy logs at `/var/log/caddy/`.

## 10. Subsequent deploys

```bash
/root/kroni/deploy.sh
```

Idempotent — fetches main, builds, migrates, reloads all 3 PM2 apps.
