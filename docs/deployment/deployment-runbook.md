# Deployment Runbook

Use this order for a standard MenuDIGI production deploy.

## Pre-Deploy

- Confirm CI is green.
- Confirm backups are current.
- Confirm rollback commit is known.
- Confirm maintenance window if migrations are risky.
- Confirm `.env` has production values and no secrets are committed.

## Backend Deploy

```bash
git fetch --all --prune
git checkout main
git pull --ff-only origin main

cd backend
composer install --no-dev --optimize-autoloader
php artisan menudigi:production-check --expect-production
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

## Frontend Deploy

```bash
cd frontend
npm ci
npm run build
```

Deploy `frontend/dist` to the configured web host or static asset service.

## Process Restart

- Restart PHP-FPM or app runtime.
- Restart queue workers.
- Restart Reverb.
- Confirm scheduler is active.

## Verification

```bash
curl -fsS https://api.example.com/api/health/live
curl -fsS https://api.example.com/api/health/ready
```

Then run the smoke checklist in `docs/deployment/smoke-test-checklist.md`.

## Rollback

1. Put the app in maintenance mode if user impact is active.
2. Revert to the previous known-good commit or release artifact.
3. Restore database backup if migrations changed data incompatibly.
4. Restore storage backup only if uploaded files were affected.
5. Rebuild Laravel caches.
6. Restart PHP-FPM, queue workers, and Reverb.
7. Check health endpoints.
8. Run smoke tests.
9. Document the incident and follow-up actions.

## Post-Deploy Monitoring

- Watch health checks for 30 minutes.
- Watch queue failures.
- Watch 500 error rate.
- Watch payment webhook logs.
- Watch Reverb connection stability.
- Confirm a test order can move through kitchen/payment workflow.
