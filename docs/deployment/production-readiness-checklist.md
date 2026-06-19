# Production Readiness Checklist

Use this checklist before deploying MenuDIGI to a production tenant.

## Environment

- Set `APP_ENV=production`.
- Set `APP_DEBUG=false`.
- Generate a strong `APP_KEY` with `php artisan key:generate --force`.
- Configure production MySQL credentials in `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.
- Use HTTPS for `APP_URL`, `FRONTEND_URL`, `FRONTEND_ADMIN_URL`, and `FRONTEND_PUBLIC_URL`.
- Set `SANCTUM_STATEFUL_DOMAINS` to the real frontend domains only.
- Do not use wildcard CORS origins in production.
- Keep payment, Telegram, Reverb, database, and mail secrets out of frontend `VITE_` variables.

## Runtime

- Run `composer install --no-dev --optimize-autoloader`.
- Run `php artisan migrate --force`.
- Run `php artisan storage:link` for public shop/category/product images.
- Run a queue worker for database-backed jobs.
- Configure the scheduler with `php artisan schedule:run`.
- Configure log rotation and retention.
- Configure backups for database and uploaded media.
- Configure monitoring for HTTP errors, queue failures, disk usage, and failed payments.
- Run `php artisan menudigi:production-check --expect-production`.
- Run `php artisan menudigi:backup-check`.
- Verify `/api/health/live` and `/api/health/ready`.
- Keep the rollback plan in `docs/deployment/deployment-runbook.md` current.

## Security

- Verify API security headers are present.
- Verify production CORS allows only approved frontend origins.
- Keep `APP_DEBUG=false` so server exceptions do not leak internals.
- Confirm rate limits are active on auth, public order, payment proof, admin, webhook, and broadcast routes.
- Configure Bakong KHQR webhook secrets before enabling real webhooks.
- Keep Telegram bot tokens server-side only.
- Confirm payment proof uploads reject scripts and oversized files.
- Review rate limits for expected restaurant traffic.
- Rotate credentials after staging tests.

## Reverb

- Use production Reverb app credentials.
- Use TLS/WSS in production.
- Verify private channel authorization for shop, branch, order, table, and kitchen channels.

## Payments

- Keep provider secrets in backend environment variables only.
- Confirm payments through authenticated staff/admin APIs only.
- Verify payment status transitions in staging.
- Keep webhook signature verification enabled where providers support it.

## Release Gate

- Backend tests pass.
- Frontend lint, tests, and build pass.
- `git diff --check` passes.
- CI is green if GitHub Actions are available.
- Smoke tests in `docs/deployment/smoke-test-checklist.md` pass.
- Backup and restore plan in `docs/deployment/backup-and-restore.md` has been tested.
- Seed/demo data policy is confirmed.
- First production admin account creation policy is confirmed.
