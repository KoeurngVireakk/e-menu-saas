# Module 40 - Security Hardening & Production Readiness

## Status

Module 40 hardens MenuDIGI for production without redesigning UI flows or pretending unfinished provider/security features are complete.

## Audit Summary

- Authentication uses Sanctum token auth with password hashing and no password fields in JSON responses.
- Backend tenant checks are already implemented across shops, branches, catalog, orders, payments, reports, kitchen, staff, and settings.
- Realtime channels are private and tenant-aware for shop, branch, table, order, and kitchen operations.
- Payment flows already include audit logs, server-side amount handling, and Bakong KHQR webhook signature support when a secret is configured.
- Public menu/order/payment endpoints needed clearer throttles and safer response shaping.
- Upload validation needed explicit MIME/extension checks and generated filenames.
- Production deployment needed a single security checklist.

## Auth Hardening

- Added `users.status` with default `active`.
- Supported account statuses are `active`, `inactive`, and `suspended`.
- Login rejects inactive and suspended users with the same generic credential message used for invalid credentials.
- Blocked login attempts are audit logged without passwords or tokens.
- Login/register routes use the named `auth` rate limiter.
- Logout continues to delete the current Sanctum access token.

## Authorization And Tenant Isolation

- Existing backend ownership and branch scoping were preserved.
- Existing role gates remain enforced server-side for catalog, staff, payment, reports, kitchen, tables, settings, shifts, and health checks.
- Existing tests cover unrelated owner access, staff branch scoping, manager/cashier/waiter restrictions, and payment role checks.

## Public API Safety

- Public order submit continues to recalculate totals server-side and ignores client-provided prices/totals.
- Public order status now returns an explicit safe payload instead of raw Eloquent order/payment models.
- Public order status excludes customer name, customer phone, proof paths, provider payment IDs, webhook timestamps, and raw payment secrets.
- Public payment response returns a safe payment summary plus required next-action data such as QR payload when applicable.
- Public menu responses now use explicit safe shop, branch, table, category, product, option, and value payloads.
- New table QR links use the existing unguessable `qr_token`; legacy `table_code` lookup remains supported for old printed links.

## Rate Limits

- `auth`: 5 requests per minute per email/IP.
- `public-menu`: 120 requests per minute per IP.
- `public-orders`: 20 requests per minute per IP.
- `payment-proof`: 10 requests per minute per IP.
- `admin-api`: 120 requests per minute per user/IP.
- `webhooks`: 60 requests per minute per IP.
- Broadcast auth uses the authenticated admin API limiter.

## CORS Policy

- Production CORS uses explicit origins only.
- Wildcard origins are filtered out.
- Supported env variables:
  - `FRONTEND_URL`
  - `FRONTEND_ADMIN_URL`
  - `FRONTEND_PUBLIC_URL`
- Localhost development origins remain available in `.env.example`.

## Security Headers

Added API security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Conservative `Permissions-Policy`

Strict CSP was intentionally not added because the Vite SPA, Reverb, image storage, and future payment provider assets need a tested production CSP policy.

## File Upload Policy

- Product/category/shop images and payment proof uploads require image validation.
- Uploads require allowed extensions and MIME types: JPG, JPEG, PNG, WEBP.
- File sizes are limited by endpoint.
- Stored filenames are generated UUIDs and do not trust original client filenames.
- Public images remain on the public disk.
- Payment proof paths are no longer exposed by public order/payment status responses.

## Payment Safety

- Payment confirmation/rejection remains authenticated and role-limited.
- Payment amounts remain server-side.
- Payment proof upload does not mark the order paid automatically.
- Provider secrets are not exposed to the frontend.
- Webhook signature verification remains required when `BAKONG_KHQR_WEBHOOK_SECRET` is configured.
- Payment confirm/reject/webhook events continue to write payment logs and audit logs.

## Realtime Security

- Private channel authorization remains tenant-aware.
- Broadcast auth is throttled with authenticated admin API limits.
- Existing realtime event payload tests confirm customer name/phone are not broadcast in operational payloads.
- Guest realtime remains limited to documented public order status behavior.

## Frontend Security

- Public menu cache now strips sensitive keys before writing data to `localStorage`.
- Payment proof files remain browser session file objects and are not stored in `localStorage`.
- API error normalization continues to hide server internals for 500 responses.
- Frontend `.env.example` exposes only client-safe URLs and Reverb public app connection values.

## Environment And Deployment Readiness

- Updated backend and frontend `.env.example` files.
- Added `docs/deployment/production-readiness-checklist.md`.
- Checklist covers production env, debug mode, app key, database credentials, queue worker, scheduler, storage link, HTTPS, CORS, Reverb, payment secrets, Telegram secrets, storage permissions, backups, log rotation, monitoring, rate limits, security headers, CI, migrations, seed policy, and admin account policy.

## Tests Added

- Security headers on API responses.
- Inactive/suspended login rejection.
- Login rate limiting.
- Public order total recalculation despite client tampering.
- Public order status sensitive-field redaction.
- Invalid public table token rejection.
- Payment proof script/oversized rejection and safe filename storage.
- CORS config wildcard protection.
- Frontend public menu cache sensitive-field stripping.

## Known Limitations And TODOs

- Strict Content-Security-Policy needs production asset/provider domains before enabling.
- Legacy printed QR links that use `table_code` still resolve; rotate/reprint production table QRs to use `qr_token`.
- Payment proof files are stored on the public disk for current app compatibility; a private disk plus authenticated media proxy is recommended for higher-sensitivity deployments.
- Webhook verification depends on provider support and `BAKONG_KHQR_WEBHOOK_SECRET` being configured.
- Password reset remains unavailable until backend reset endpoints are implemented.
- Remote GitHub Actions must be checked separately when available.
