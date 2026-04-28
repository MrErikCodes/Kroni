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
sudo cp /srv/kroni/Caddyfile.example /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 7. Application user + checkout

```bash
sudo useradd -m -s /bin/bash kroni
sudo -u kroni mkdir -p /home/kroni/.ssh
# add SSH deploy key for the repo
sudo -u kroni git clone git@github.com:nilsenkonsult/kroni.git /srv/kroni
sudo chown -R kroni:kroni /srv/kroni

# Production .env
sudo -u kroni cp /srv/kroni/backend/.env.example /srv/kroni/backend/.env
sudo -u kroni $EDITOR /srv/kroni/backend/.env   # fill DATABASE_URL, REDIS_URL, CLERK_*, KID_JWT_SECRET, EXPO_ACCESS_TOKEN

# First build + migrate + boot
sudo -u kroni bash -lc 'cd /srv/kroni && npm ci'
sudo -u kroni bash -lc 'cd /srv/kroni && npm --workspace=@kroni/shared run build'
sudo -u kroni bash -lc 'cd /srv/kroni && npm --workspace=@kroni/backend run build'
sudo -u kroni bash -lc 'cd /srv/kroni && npm --workspace=@kroni/backend run db:migrate'
sudo -u kroni bash -lc 'cd /srv/kroni && npm --workspace=website run build'

# Start under PM2 + persist across reboot
sudo -u kroni bash -lc 'cd /srv/kroni/backend && pm2 start ecosystem.config.js'
sudo -u kroni pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u kroni --hp /home/kroni
sudo systemctl enable pm2-kroni
```

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
sudo -u kroni /srv/kroni/deploy.sh
```
