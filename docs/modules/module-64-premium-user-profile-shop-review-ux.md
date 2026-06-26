# Module 64 - Premium User Profile, Shop Profile, And Reviews UX

## Purpose

Module 64 upgrades staff/user management, account profile, shop settings, and customer reviews while preserving MenuDIGI's real-data product contract. Reviews were missing, so this module adds a small secure backend review system before exposing admin and public UI.

## Backend Review Contract

- Public customers can submit one review per order through `POST /api/public/orders/{orderNumber}/review`.
- Review submission requires the order to be both `completed` and `paid`.
- Admin users with review permissions can list shop reviews through `GET /api/shops/{shop}/reviews`.
- Admin users can filter by rating, status, and date range.
- Admin users can update status through `PUT /api/reviews/{review}/status`.
- Public shop reviews are exposed through `GET /api/public/shops/{slug}/reviews` and only include visible reviews.

## Security Notes

- Review payloads do not expose customer phone, customer name, proof paths, provider secrets, or raw payment data.
- Reviews are shop and branch scoped through existing tenant access helpers.
- Public review creation is order scoped and prevents duplicate reviews.
- Staff users cannot change or remove their own staff assignment role/status.
- Staff, settings, and review admin routes remain permission-aware.

## UX Improvements

- Staff management keeps a list-first workflow with premium summary cards, search, role/status/branch filters, mobile-safe row cards, role badges, status badges, and clear real actions.
- Account profile keeps email read-only, requires the current password for password changes, and adds recent activity context to the profile summary.
- Settings keeps only backend-saved fields, improves the restaurant profile area, preserves public menu preview, and adds a real review summary from the reviews endpoint.
- Reviews adds `/admin/reviews` with summary metrics, filters, rating stars, status badges, safe order references, empty/no-results states, and moderation actions.
- Order success adds a customer review form only when the order is completed and paid, with a submitted state and locked-state explanation otherwise.

## Khmer And I18n

- Added English and Khmer keys for reviews, rating/status actions, public review submission, account activity summary, and navigation labels.
- Edited Khmer-facing labels avoid uppercase assumptions and use existing Khmer text classes where rendered.

## Tests

- Backend feature coverage validates review eligibility, duplicate prevention, safe public/admin payloads, admin status updates, public visibility filtering, and staff self-target protection.
- Frontend coverage validates staff filters, review admin list/actions/empty state, settings review summary, public review submission, permissions, and centered staff modal behavior.

## Known Limitations

- Public reviews are shown only through the new endpoint and order-success submission flow; the QR menu page does not render a public reviews preview yet.
- Review submission is intentionally unavailable until an order is completed and paid.
- Physical-device QA and Playwright visual review are not part of this local module pass.
