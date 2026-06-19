# Module 48.5 - Shop UI, Admin UX Debt Cleanup & Missing Feature Polish

## Purpose

Module 48.5 removes remaining high-visibility admin UX debt in shop management, print station routing, and tenant settings without changing backend APIs or faking unavailable features.

## Scope Completed

- Reworked shop management from a permanent two-column form into a list-first CRUD workspace with search, status filter, drawer create/edit, sticky drawer footer, brand preview, media helper copy, empty/no-results states, and safer delete confirmation copy.
- Reworked print stations into a list-first operations workspace with shop/type filters, drawer create/edit, station routing summary, clear default-station guidance, empty/no-results states, and safer delete confirmation copy.
- Refined settings into grouped sections for identity, branding, billing defaults, and Telegram notifications with quick section links, owner-only edit messaging, sticky save action, and a stronger brand preview.
- Added focused Vitest coverage for shop drawer behavior, shop empty state action, print station drawer behavior, and settings grouped sections.
- Added Khmer/English i18n keys for the new admin UX copy so these flows can be fully wired into the translation layer in a future pass.

## User Flows Audited

- Owner creates or edits a shop profile.
- Owner reviews shop branding before saving.
- Owner filters shops by name/status and recovers from no-results state.
- Owner configures kitchen, cashier, bar, and receipt print stations.
- Owner reviews default print station routing by station type.
- Owner updates tenant settings for branding, billing defaults, receipt prefixes, and Telegram notifications.
- Manager or non-owner views settings with clear owner-only edit messaging.

## Visual Hierarchy Improvements

- Page-level headers now explain business purpose before the table/form work begins.
- Primary actions are placed in the page header and empty states.
- Tables emphasize row identity first, then contact/routing/status details.
- Brand and routing preview panels sit beside the list on wide screens and stack naturally on smaller widths.
- Settings sections use consistent cards, descriptions, and section jump controls.

## Empty, Loading, Error, and No-Results Improvements

- Shops and print stations now distinguish first-time empty states from filtered no-results states.
- Empty states explain why the record matters and provide a safe primary action when permissions allow.
- Load failures render retry actions without implying data changed.
- Loading continues to use shared table skeletons and existing settings loading/error states.

## CRUD and Drawer Improvements

- Create/edit forms moved into `CreateEditDrawer` with accessible dialog semantics and sticky save/cancel footer.
- Shop form includes helper text for public name, description, logo, cover, and color fields.
- Print station form includes helper text for branch scope, station name, and default station behavior.
- Shop multipart submit now includes only editable fields plus selected media files.
- Destructive actions use clearer business impact copy.

## Settings Improvements

- Settings are grouped into Identity, Branding, Billing defaults, and Telegram notifications.
- The selected shop selector is separated from the long form.
- Owner-only edit status is visible before the form.
- Brand preview better reflects cover, logo, colors, currency, and receipt defaults.
- Telegram test flow and existing payload shape were preserved.

## i18n Improvements

- Added English and Khmer keys under `adminUx` for shops, print stations, settings, empty states, delete confirmations, and save actions.
- Existing product option copy remains unchanged except for documenting that the backend-compatible JSON shape is still preserved.

## Accessibility Fixes

- Shop and print station forms now use drawer dialog semantics through the shared drawer.
- Tables use accessible labels.
- Form fields include explicit labels and helper text.
- Delete actions retain visible text, not icon-only controls.
- Settings sections use labelled cards and visible owner-only state.

## Performance Protection

- No new UI libraries were added.
- No Echo/Pusher, chart, or SweetAlert2 global imports were added.
- Existing route lazy loading and Vite chunk strategy remain unchanged.
- Changes are limited to admin pages, tests, translations, and documentation.

## Tests Added or Updated

- `frontend/src/pages/admin/shops/ShopsPage.test.jsx`
- `frontend/src/pages/admin/print-stations/PrintStationsPage.test.jsx`
- `frontend/src/pages/admin/settings/SettingsPage.test.jsx`

## Manual Review Checklist

- `/admin/shops` at 375px, 430px, 768px, 1024px, and 1440px.
- `/admin/print-stations` at 375px, 430px, 768px, 1024px, and 1440px.
- `/admin/settings` at 375px, 430px, 768px, 1024px, and 1440px.
- Verify shop drawer create/edit, logo/cover helper text, brand preview, filters, and delete confirmation.
- Verify print station drawer create/edit, branch selector, default station toggle, routing summary, filters, and delete confirmation.
- Verify settings owner-only view, sticky save action, Telegram test button, and brand preview.
- Switch to Khmer in the shell and review new copy readiness where keys are wired.

## Known Limitations and TODOs

- Shop and print station pages now have translation keys, but visible labels remain mostly static until these admin pages are fully wired to `useLanguage`.
- Product options still use the backend-compatible JSON helper; a visual option builder remains a future backend-contract-safe enhancement.
- Existing older admin pages such as staff, expenses, invoices, shifts, cash ledger, and daily closing were not deeply rewritten in this module to avoid broad regression risk.
