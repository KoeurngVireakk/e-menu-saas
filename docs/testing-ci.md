# Testing and CI

Module 18 adds automated checks for backend API behavior, frontend UI utilities, and GitHub pull requests.

## Backend Tests

Run from `backend`:

```bash
php artisan test
php artisan route:list
php artisan migrate:fresh --seed
```

PHPUnit is configured in `backend/phpunit.xml` for:

- `APP_ENV=testing`
- SQLite in-memory database
- array cache/session drivers
- sync queue driver
- low bcrypt rounds for fast auth tests

Feature tests use migrations through `RefreshDatabase`, so they do not require a local MySQL database.

## Frontend Tests

Run from `frontend`:

```bash
npm run lint
npm run test
npm run build
```

Vitest uses jsdom and `@testing-library/react` for component tests. The setup file is `frontend/src/test/setup.js`.

## CI Workflow

GitHub Actions workflow: `.github/workflows/ci.yml`

It runs on:

- pull requests
- pushes to `main`

Backend job:

- checks out the repository
- sets up PHP 8.3
- installs Composer dependencies
- copies `.env.example` to `.env`
- generates an app key
- runs `php artisan test`
- runs `php artisan route:list`

Frontend job:

- checks out the repository
- sets up Node 22
- installs with `npm ci`
- runs `npm run lint`
- runs `npm run test`
- runs `npm run build`

No production secrets are needed or committed for CI.

## When CI Fails

1. Open the failed job and read the first failing command.
2. Reproduce the command locally from `backend` or `frontend`.
3. Fix the underlying test, lint, migration, or build issue.
4. Rerun the full local command set before pushing.

Do not bypass CI for module work unless the failure is confirmed to be unrelated infrastructure downtime.

## Required Coverage Before New Modules

Before merging new modules, add or update tests for:

- authentication and authorization changes
- shop, branch, category, product, and option behavior
- public ordering and payment behavior
- audit log behavior for important admin actions
- system health or observability changes
- cart calculations and option handling
- user-facing error states

Tests should assert business behavior and permissions, not implementation details that make refactoring hard.
