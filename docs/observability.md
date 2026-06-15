# Observability and Error Reporting

Module 17 adds production-safe diagnostics for the E-Menu SaaS frontend and Laravel API.

## Laravel Logs

- Laravel application logs are written under `backend/storage/logs`.
- In local development, run `php artisan pail` from `backend` for live log streaming.
- In production, review the configured Laravel log channel in `backend/config/logging.php`.
- Server errors returned from API routes keep the public JSON shape:

```json
{
  "success": false,
  "message": "Server error",
  "errors": {}
}
```

Production responses must not expose exception traces. Use server logs for stack traces.

## Frontend Errors

- React rendering failures are caught by `frontend/src/components/ErrorBoundary.jsx`.
- Normal users see a clean recovery screen with reload and home/admin actions.
- Render error details are written to the browser console only when `import.meta.env.DEV` is true.
- API errors are normalized in `frontend/src/api/axios.js` before pages or alerts consume them.

## Audit Logs

- Admin activity is stored in the `audit_logs` table.
- Logged actions include login, logout, shop/branch/category/product mutations, order status changes, and payment confirmation/rejection.
- Audit metadata is limited to operational identifiers, names, statuses, and status transitions.

## Do Not Log

Never log:

- Passwords or password confirmations.
- Sanctum tokens or full `Authorization` headers.
- Payment proof file uploads or raw private file paths.
- Full request payloads for payment, auth, or customer order submission.
- Secret environment values, API keys, database credentials, or session cookies.

## System Health

- Authenticated owners and super admins can call `GET /api/system/health`.
- The admin UI page is `/admin/system-health`.
- The health response reports safe status for the API, database, cache, queue configuration, public storage probe, app environment, and optional app version.
- The endpoint is protected by `auth:sanctum` and role checks.

## Production Monitoring Recommendations

- Ship Laravel logs to a central log store such as CloudWatch, Datadog, Grafana Loki, Papertrail, or ELK.
- Add alerting for HTTP 500 spikes, failed queue jobs, database connection failures, and storage write failures.
- Monitor frontend build deploys with uptime checks against the public menu, login page, and `/api/health`.
- Track failed payment rates and repeated order status update failures.
- Keep log retention aligned with business and privacy requirements.

## Future Error Reporting

Sentry or Bugsnag can be added later:

- Frontend: initialize the SDK near `frontend/src/main.jsx` and connect it to the React error boundary.
- Backend: install the Laravel SDK and configure environment-based sampling.
- Scrub request headers, tokens, cookies, passwords, and payment proof metadata before sending events.
