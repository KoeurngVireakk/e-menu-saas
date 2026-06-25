# Module 63 - Premium UX Consistency Cleanup And Remaining UI Debt Fix

## Purpose

Module 63 cleans up remaining premium UI debt after Modules 60, 61, and 62. The work stays deliberately scoped: no full repaint, no new UI libraries, no fake realtime, no fake payment readiness, no new backend behavior, and no route removal.

## Admin Operations Improvements

- Orders and payments now use shared operation translation keys for page context, filters, table headers, row actions, empty states, and confirmation copy.
- Order status changes and payment review confirmations now use calmer, more explicit copy.
- Kitchen page labels, filters, station actions, and empty states now use localized copy and avoid forced uppercase in edited headings.
- Payment detail drawers now show an explicit no-proof state instead of silently omitting the proof review section.

## Customer QR Improvements

- Category tabs now receive localized accessible labels while keeping the existing active state.
- Product cards have less cramped mobile image/action proportions and full-width add actions on narrow screens.
- Cart summary uses localized item copy and adds a clear confirmation note before submit.
- Payment page now gives clearer instruction copy and stronger selected-proof feedback.
- Public loading and cached-menu copy are localized for payment, order-success, and saved-menu states.

## Khmer And I18n Improvements

- Route-level `lang="km"` containers now inherit Khmer font, line-height, no-uppercase, and no-letter-spacing safeguards, not only `html[lang="km"]`.
- Status badges no longer rely on CSS capitalization and now use Khmer-readable text rhythm.
- New English and Khmer keys cover operation filters/actions, payment proof review states, and public QR microcopy.

## CRUD And Empty-State Notes

- Existing list-first CRUD flows and centered create/edit modals are preserved.
- Existing destructive actions remain confirmation-based.
- Empty and error states on edited surfaces explain what appears there and offer retry or clear next action where already supported.

## Tests Added Or Updated

- No new tests were added because this module changes presentation, copy, and responsive layout details without changing business behavior or payload contracts.
- Existing Vitest coverage for public ordering, CRUD modal behavior, status badges, routing, and shared UI remains the regression safety net.

## Known Limitations

- Physical-device QA and Playwright screenshot review were not run in this local pass.
- Some older admin pages outside the edited high-priority routes still contain English-only operational copy and should be migrated in later i18n-only cleanup.
- GitHub Actions status is not implied by local checks.
