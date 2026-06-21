# Module 58 — Notification Automation, Payment Settings & Account Activity Audit

## Purpose

Module 58 connects Module 57 account/profile, notifications, and settings completion to real business events and saved settings. It adds account activity audit logs, extends notification automation, and introduces a real shop payment settings contract without exposing provider secrets.

## Notification event wiring

- Order creation continues to write real `order.created` notification logs through the existing notification service.
- Manual KHQR/ABA proof uploads write real `payment.proof_uploaded` logs.
- Payment rejection writes real `payment.failed` logs.
- Payment confirmation now also writes real `payment.paid` logs.
- Notification API maps stored events to stable product types:
  - `order.created` → `new_order`
  - `payment.proof_uploaded` → `payment_uploaded`
  - `payment.paid` → `payment_confirmed`
  - `payment.failed` → `payment_rejected`

## Account activity audit

- Added `account_activity_logs`.
- Added `GET /api/account/activity`.
- Logged events:
  - `profile_updated`
  - `password_changed`
  - `preferences_updated`
  - `login_success`
  - `login_blocked`
  - `logout`
- Activity is scoped to the authenticated user only.
- Metadata is sanitized to exclude passwords, tokens, proof paths, provider payloads, secrets, and API keys.

## Payment settings contract

Payment settings are stored in the existing `shop_settings` key/value table:

- `cash_enabled`
- `aba_enabled`
- `bakong_enabled`
- `payment_instructions`
- `proof_upload_required`
- `auto_confirm_cash`
- `payment_qr_label`

The public payment flow now uses the saved settings:

- Disabled payment methods are not returned in public order payment methods.
- Disabled payment methods are rejected with validation errors.
- Manual KHQR/ABA proof upload requirement follows `proof_upload_required`.
- Cash payments are marked paid automatically only when `auto_confirm_cash` is enabled.

## Notification UX improvements

- Notification page includes All, Unread, Orders, Payments, System, and Account tabs.
- Account tab shows real account activity logs.
- Notification cards show stable event labels and safe action links to existing admin routes.
- Navbar notification dropdown now includes loading, empty, error retry, latest 5 notifications, mark all as read, and view all.

## Settings completion improvements

- Completion now includes branding basics and payment method configured.
- Payment method configured is based on saved payment settings only.
- Existing completion checks remain based on real shop, branch, category, product, table QR, Telegram, and public menu data.

## Security rules

- Notification list remains tenant/branch scoped.
- Notification read state remains per-user.
- Notification payload excludes proof paths, provider secrets, raw provider payloads, and unapproved metadata.
- Payment settings require existing shop settings owner/super-admin permission.
- Branch-scoped users cannot update shop-wide payment settings.
- Merchant API keys/secrets are not shown or accepted in the payment settings UI.
- Account activity is only visible to the current authenticated user.

## i18n additions

- Added English and Khmer labels for notification event types, account activity, payment settings, proof upload, payment instructions, load more, retry, and account tab labels.
- Khmer copy avoids forced uppercase and keeps operational labels readable.

## Tests added/updated

- Backend notification event wiring for order creation, payment proof upload, payment confirmation.
- Backend payment settings update, validation, public method filtering, proof requirement behavior.
- Backend account activity creation and current-user scoping.
- Frontend account activity section.
- Frontend notification Account tab and Khmer labels.
- Frontend payment settings save and completion checklist.

## E2E/visual result

- Optional Playwright E2E/visual checks were run locally after the unit/build checks.
- They failed on protected admin routes redirecting to `/login` before heading assertions in existing E2E specs.
- The failures are tracked as E2E auth-harness issues, not as notification/payment/account API failures.

## Known limitations/TODOs

- Email update remains read-only until a verified email-change flow exists.
- System health warning notifications were not added because no real warning event producer exists yet.
- Bakong availability still depends on existing backend sandbox/provider configuration.
- Merchant credentials remain outside the settings UI by design.
