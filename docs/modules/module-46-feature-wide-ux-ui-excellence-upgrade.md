# Module 46 - Feature-Wide UX/UI Excellence Upgrade

## Purpose

Module 46 improves MenuDIGI through shared UI contracts and focused feature polish instead of broad restyling. The work protects existing Laravel APIs, auth, reports, PWA/offline behavior, realtime boundaries, Playwright E2E coverage, Vitest separation, and Vite manual chunks.

## Prerequisite CI Stabilization

- Confirmed backend readiness tests avoid empty secret assertions from SQLite CI contexts.
- Confirmed Vitest only collects unit/component tests under `frontend/src` and excludes Playwright E2E files and artifacts.
- Stabilized the dashboard unit test by mocking lazy chart modules so Recharts cannot resolve after jsdom teardown.

## Features Audited

- Public/marketing: landing, login, register, reset-password messaging limitations.
- Admin shell: sidebar, navbar, command palette, language toggle, realtime badge, user/account area, notification placeholder.
- Owner setup: setup checklist, dashboard onboarding, empty shop/product/table guidance.
- Dashboard: KPI cards, needs-attention cards, recent orders, shops, charts, quick actions, reports teaser.
- Catalog: products, categories, branches, tables/QR, product options JSON workflow.
- Operations: orders, kitchen, payments, order/payment drawers, status actions, realtime feedback.
- Business: reports, cash ledger, invoices, expenses, staff, settings, system health.
- Customer QR: public menu, product detail sheet, cart, checkout, payment, order success/status, offline/PWA prompts.
- Testing/QA: PHPUnit, Vitest, Playwright E2E/visual separation, production build chunking.

## Design-System Improvements

- `AppSheet` now exposes `aria-labelledby` and `aria-describedby`, closes on Escape/backdrop, restores focus, locks background scroll, and keeps footer actions in a dedicated sticky footer.
- `CreateEditDrawer` now delegates title/description/footer semantics to `AppSheet`, keeping CRUD drawers consistent and mobile-friendly.
- Shared form controls now use explicit labels, helper text, error text, `aria-describedby`, and `aria-invalid` relationships so validation copy is announced without polluting field names.
- `AppEmptyState` supports an unframed mode for use inside existing cards/drawers, reducing nested-card clutter.
- `AppTable` now supports actionable empty states, table labels, row-action header semantics, and sortable header `aria-sort` state.

## Landing Improvements

The landing page was audited against Module 44/45 polish. No new landing code was changed in this module because the existing hero, CTA hierarchy, mockups, pricing placeholder, FAQ, Khmer toggle, and lazy route setup already matched the current scope.

## Auth Improvements

Login/register/reset messaging was audited. No auth code was changed in this module because existing forms already include mobile spacing, password visibility, loading states, bilingual labels, and honest reset-password limitation copy.

## Admin Shell Improvements

The admin shell, command palette, sidebar, navbar, realtime badge, and language toggle were audited. The main shell contracts remain intact; drawer and table semantics now improve the admin feature surfaces that the shell hosts.

## Dashboard Improvements

- Dashboard lazy chart tests were stabilized without changing production lazy loading.
- Nested empty states in recent orders and shops now render unframed inside their parent panels.
- Existing dashboard control-tower structure remains: KPIs, setup checklist, needs attention, charts, recent orders, analytics snapshot, quick actions, shops.

## CRUD Improvements

- Product/category/branch/table CRUD drawers benefit from improved `AppSheet` accessibility, Escape handling, focus restoration, scroll locking, and sticky footer actions.
- Form fields in CRUD drawers now support helper/error text associations through shared form controls.
- Table empty states can now show a clear next action such as add product or clear filters.
- Products table has an explicit table label and actionable no-results behavior.

## Product Options Improvements

- Kept the existing backend-compatible JSON payload shape.
- Added a visible option-group example with `single`, `is_required`, `values`, and `extra_price` structure.
- Added a copy example action where browser clipboard support exists.
- Added inline validation for invalid JSON syntax, non-array payloads, missing group names, invalid option type, missing values, and missing value names.
- Documented visual option builder as a future enhancement instead of introducing a risky payload rewrite.

## Operations Improvements

Orders, kitchen, and payment surfaces were audited. No operation API or realtime event behavior was changed. Existing status badges, drawer workflows, kitchen cards, payment proof review, and realtime status copy remain protected.

## Reports Improvements

- Reports no-data empty state now renders unframed inside the existing reports layout.
- Recharts remains lazy-loaded and admin-only.
- Existing report filters, KPI cards, chart titles, chart descriptions, export action, and no-data copy remain intact.

## Customer QR Improvements

- Cart drawer empty state now renders unframed inside the drawer to avoid visual nesting.
- Existing public menu, product detail sheet, sticky cart, cart review, checkout offline block, payment proof preview, order status, and PWA/offline behavior remain unchanged and protected.

## Alerts And Feedback Improvements

- Product option validation now gives inline field feedback and a toast error.
- Clipboard success/failure for the option example uses existing toast channels.
- Destructive confirmations and existing SweetAlert2 boundaries were not changed.

## Khmer/English i18n Improvements

- Added English/Khmer translation keys for the new product-options guidance, example label, copy action, and helper copy.
- Reused the existing `LanguageProvider` and `useLanguage` hook; no new i18n library was added.
- The existing translation layer was audited, including command palette, realtime, auth, reports, public ordering, checkout, payment, and offline/PWA copy.
- Full admin CRUD i18n remains a future pass because product/category names and many page-local CRUD labels are still backend or page-local strings.

## Animation And Transitions

- Preserved existing framer-motion page, empty-state, command palette, and public cart transitions.
- No new heavy animation was added; drawer behavior improved through interaction semantics rather than a new motion dependency.

## Accessibility Fixes

- Drawer/dialog title and description linkage.
- Escape close and focus restoration for drawers.
- Background scroll lock while drawers are open.
- Form helper and error text announced through `aria-describedby`.
- Form invalid state exposed through `aria-invalid`.
- Table labels, row-action heading semantics, and sortable header `aria-sort`.
- Empty states can render without nested card landmarks when inside an existing panel.

## Mobile QA Fixes

- CRUD drawer footers now stay in a dedicated footer outside the scrolling form body.
- Drawer background scroll is locked to reduce mobile scroll bleed.
- Table no-results states avoid nested cards and preserve clear action placement.

## Performance Protection

- Route lazy loading remains unchanged.
- Chart components remain lazy-loaded and separate from landing/public bundles.
- Echo/Pusher imports remain scoped to realtime utilities.
- SweetAlert2 remains behind existing alert helpers.
- Vitest and Playwright suites remain separated.
- Production build was checked for large chunk warnings.

## Tests Added Or Updated

- `AppSheet.test.jsx`: title/description linkage, Escape close, focus restoration.
- `FormControls.test.jsx`: helper/error accessibility relationships.
- `AppTable.test.jsx`: actionable empty state and sortable table header semantics.
- `CreateEditDrawer.test.jsx`: dialog description and footer submit workflow.
- `ProductsPage.test.jsx`: product-options example and inline JSON validation.
- `Dashboard.test.jsx`: lazy chart mocks for stable jsdom teardown.

## Manual Review Checklist

- `/`, `/login`, `/register`
- `/admin`, `/admin/products`, `/admin/categories`, `/admin/branches`, `/admin/tables`
- `/admin/orders`, `/admin/payments`, `/admin/kitchen`, `/admin/reports`, `/admin/settings`
- `/admin/cash-ledger`, `/admin/invoices`, `/admin/expenses`, `/admin/staff`, `/admin/system-health` where role access allows
- `/menu/:shopSlug`, `/cart`, `/payment/:orderNumber`, `/order-success/:orderNumber`
- Widths: 375px, 430px, 768px, 1024px, 1440px

## Known Limitations And TODOs

- Visual product option builder remains a TODO; JSON remains the safe backend-compatible workflow.
- Full admin CRUD i18n remains a future pass; this module did not translate backend-provided names or large page-local CRUD strings.
- Remote GitHub Actions status is not claimed here unless checked separately.
- Manual visual review still needs browser inspection across all listed widths after deployment data is available.
