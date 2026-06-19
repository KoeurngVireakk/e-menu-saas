# Module 48 - Production Deployment Infrastructure

## Purpose

Module 48 adds safe, example-based production deployment templates for MenuDIGI without enabling automatic deployment or committing secrets. It covers Nginx, PHP-FPM, queue workers, scheduler, Reverb, Docker, deployment scripts, environment placeholders, and deployment documentation.

## Deployment Assets

- `deploy/nginx/menudigi.conf.example`
- `deploy/php/php-fpm-production.ini.example`
- `deploy/supervisor/*.conf.example`
- `deploy/systemd/*.service.example`
- `deploy/docker/*.example`
- `deploy/scripts/*.sh.example`

## Nginx And PHP-FPM

The Nginx template supports frontend static files, Laravel API routing, public storage, static asset caching, upload size limits, security headers, and Reverb WebSocket proxying. PHP settings document OPcache, upload limits, memory, execution time, and hidden display errors.

## Queue, Scheduler And Reverb

Supervisor and systemd examples are included for:

- Laravel queue worker.
- Laravel scheduler.
- Reverb WebSocket process.

All process templates use placeholders for deploy user, group, and paths.

## Docker Templates

Docker examples include PHP-FPM backend, frontend static Nginx build, MySQL, Redis, queue worker, scheduler, and Reverb. They are production templates and require real env/secrets plus staging verification before use.

## Deployment Scripts

Example scripts cover deploy, rollback, and health checks. Destructive actions such as `rsync --delete`, symlink switching, service reloads, and rollback steps are commented or documented for review before use.

## Environment Changes

`backend/.env.example` and `frontend/.env.example` now include commented production placeholders for app URL, frontend URL, MySQL, Redis, queue/cache/session, Reverb, version/commit, API base URL, and slow API logging.

## Production Validation

Existing commands are documented:

- `php artisan menudigi:production-check --expect-production`
- `php artisan menudigi:backup-check`

No code changes were needed for these commands.

## Documentation Added

- Production server setup.
- Nginx/PHP-FPM setup.
- Docker production template.
- Reverb/queue/scheduler setup.
- Cloudflare/SSL checklist.
- GitHub Actions deploy template notes.

## CI/CD Notes

No automatic deploy workflow was added because production secrets are not configured. A docs-only GitHub Actions template is included for future controlled deployment.

## Tests

No tests were added because Module 48 changes are templates and documentation only.

## Known Limitations

- Templates require server-specific paths, users, domains, and TLS certificates.
- Docker templates are not a verified one-command deployment.
- Remote GitHub Actions are not claimed unless checked separately.
- Production deployment still requires staging validation and real secret management.
