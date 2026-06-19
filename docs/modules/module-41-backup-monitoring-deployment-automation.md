# Module 41 - Backup, Monitoring & Deployment Automation

## Status

Module 41 prepares MenuDIGI for production operations without changing customer/admin business behavior.

## Purpose

- Add public-safe health endpoints for uptime and readiness checks.
- Add operator commands for production and backup prerequisite checks.
- Document backup, restore, monitoring, deployment, rollback, and process management.
- Improve CI with a repository whitespace check.

## Health Checks

Added:

- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`

The live endpoint confirms the Laravel app can respond without a database dependency.

The ready endpoint checks:

- Database connection.
- Cache write/read.
- Public storage write/read.

Responses include app name, status, timestamp, optional version, and optional commit. They do not expose paths, credentials, stack traces, or secrets.

## Backup Strategy

Created `docs/deployment/backup-and-restore.md` with:

- MySQL dump and restore commands.
- Uploaded storage archive and restore commands.
- Backup scope and exclusions.
- Retention guidance.
- Encryption and offsite storage guidance.
- Restore drill schedule.
- Emergency restore steps.

## Monitoring And Logging

Created `docs/deployment/monitoring-and-logging.md` with:

- Laravel, queue, scheduler, Reverb, web server, payment webhook, frontend build, and audit log sources.
- Sensitive values that must never be logged.
- Recommended alerts for health, queues, scheduler, DB, payment webhooks, disk space, backups, and Reverb.

## Deployment Runbook

Created `docs/deployment/deployment-runbook.md` with:

- Pre-deploy checklist.
- Git pull strategy.
- Composer install.
- Production environment validation.
- Migrations.
- Storage link.
- Config/route/view cache.
- Frontend build.
- Queue/Reverb/PHP process restarts.
- Health verification.
- Rollback procedure.
- Post-deploy monitoring.

## Process Management

Created `docs/deployment/process-management.md` with:

- Required production processes.
- Supervisor examples for queue workers and Reverb.
- Scheduler cron example.
- Runtime env keys.
- Laravel writable path permissions.

## Production And Backup Check Commands

Added:

- `php artisan menudigi:production-check`
- `php artisan menudigi:production-check --expect-production`
- `php artisan menudigi:backup-check`

The commands print only ok/warning/error labels and do not print secret values.

`production-check` verifies common readiness items such as APP key, debug mode, DB connection, storage writability, queue/cache config, frontend/CORS configuration, Reverb config when enabled, and payment secrets when Bakong production payments are enabled.

`backup-check` verifies database access, public storage directory, write permissions, storage link presence, backup env variable presence, and cache probe metadata.

## CI/CD Notes

- Existing PHP 8.4 and SQLite `DB_DATABASE=":memory:"` settings were preserved.
- Existing backend tests, route list, frontend lint, frontend tests, and frontend build remain in CI.
- Added a root `git diff --check` repository job.
- No deploy workflow was added because production secrets and target infrastructure are not configured in this repo.

## Smoke Tests

Created `docs/deployment/smoke-test-checklist.md` for:

- Public page checks.
- Admin page checks.
- API health/auth/menu checks.
- Product, order, payment, proof upload, kitchen, realtime, logs, queue, scheduler, and backup checks.

## Environment Updates

Updated backend `.env.example` with:

- `APP_VERSION`
- `APP_COMMIT`
- `LOG_DAILY_DAYS`
- Queue retry keys.
- Reverb server keys.
- Backup disk, retention, and encryption key placeholders.

No real secrets were added.

## Known Limitations And TODOs

- The backup commands are checks only; actual scheduled backup execution must be configured on the server or backup platform.
- Health readiness checks public storage because current uploads use the public disk.
- Supervisor/systemd examples require server-specific paths and users before use.
- Remote GitHub Actions are not claimed unless checked separately.
- A deploy workflow should be added only after production target, secret names, approval gates, and rollback procedure are finalized.
