# MenuDIGI Production Server Setup

## Server Requirements

- Ubuntu 22.04/24.04 LTS or equivalent Linux host.
- PHP 8.4 with FPM, OPcache, PDO MySQL, GD, zip, intl, bcmath, mbstring, and fileinfo.
- Nginx 1.24+.
- MySQL 8.0/8.4.
- Redis 7+ recommended for cache, sessions, queues, and Reverb scaling.
- Node.js 20+ for building the React frontend.
- Composer 2.
- Supervisor or systemd for queue, scheduler, and Reverb processes.
- TLS certificate from Let's Encrypt, Cloudflare Origin CA, or another trusted provider.

## Deployment Architecture

- Nginx serves the Vite `frontend/dist` static app.
- Nginx forwards `/api`, `/sanctum`, and Laravel PHP routes to PHP-FPM.
- Laravel stores public uploads under `backend/storage/app/public` exposed through `backend/public/storage`.
- Queue workers run `php artisan queue:work`.
- Scheduler runs `php artisan schedule:work`.
- Reverb runs `php artisan reverb:start` and is proxied through Nginx for WebSocket traffic.
- MySQL stores application data.
- Redis is recommended for `CACHE_STORE`, `SESSION_DRIVER`, and `QUEUE_CONNECTION`.

## Deployment Flow

1. Provision system packages.
2. Create a deploy user such as `menudigi`.
3. Clone the repository into a release path.
4. Create `backend/.env` from `backend/.env.example` using real server secrets.
5. Create `frontend/.env.production` or CI build secrets for Vite public variables.
6. Run `composer install --no-dev --optimize-autoloader`.
7. Run `npm ci && npm run build` inside `frontend`.
8. Run `php artisan migrate --force`.
9. Run `php artisan storage:link`.
10. Cache Laravel config, routes, views, and events.
11. Start or reload PHP-FPM, Nginx, queue worker, scheduler, and Reverb.
12. Run smoke tests and health checks.

## Required Laravel Commands

```bash
cd backend
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan queue:restart
php artisan menudigi:production-check --expect-production
php artisan menudigi:backup-check
```

## Storage Permissions

The PHP-FPM user must be able to write:

- `backend/storage`
- `backend/bootstrap/cache`

Example:

```bash
sudo chown -R menudigi:www-data backend/storage backend/bootstrap/cache
sudo chmod -R ug+rwX backend/storage backend/bootstrap/cache
```

## Environment Checklist

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` set through `php artisan key:generate --show`
- `APP_URL` points to the backend/API origin.
- `FRONTEND_URL`, `FRONTEND_ADMIN_URL`, and `FRONTEND_PUBLIC_URL` point to the frontend origin.
- `DB_*` points to production MySQL.
- `CACHE_STORE`, `SESSION_DRIVER`, and `QUEUE_CONNECTION` use Redis or another production-ready backend.
- `REVERB_*` values are set and match frontend `VITE_REVERB_*` values.
- Payment provider secrets are present only on the backend server.
- `API_SLOW_LOG_MS` is tuned for monitoring.
- `APP_VERSION` and `APP_COMMIT` are set by deployment.

## Smoke Tests

- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`
- Login as a test owner.
- Open `/admin`.
- Open a public menu route.
- Submit a test order only in a staging environment.
- Confirm queue worker processes jobs.
- Confirm Reverb connects from the admin shell.

## Backup And Restore

Use `docs/deployment/backup-and-restore.md` for backup design and restore rehearsal. Run `php artisan menudigi:backup-check` before enabling scheduled backups.

## Monitoring

Use `docs/deployment/monitoring-and-logging.md` for log, health, queue, and slow API monitoring. Keep request bodies and provider secrets out of logs.

## Rollback

Use release directories or a deployment platform rollback feature. Do not automatically roll back migrations unless the migration is explicitly reversible and data-safe. The example rollback script documents the manual review points.

## Known Limitations

- These templates require server-specific paths and process names.
- Docker examples are templates, not verified one-command production deployment.
- Remote CI/deploy automation is not enabled until production secrets exist.
