# Module 59 — Premium UX/UI System Upgrade

## Purpose

Module 59 refines MenuDIGI's shared UX/UI system so landing, auth, admin, CRUD, operations, reports, settings, notifications, and public QR ordering feel more consistent, premium, Khmer-readable, responsive, and accessible.

This module is a design-system refinement pass. It does not rebuild the app, add UI libraries, change backend business logic, fake data, fake realtime, or remove routes.

## Inspiration Sources

- Vercel-style dashboard navigation: prioritized, compact shell and clear mobile navigation.
- Stripe-style product consistency: restrained color, precise spacing, clear focus states, and reusable primitives.
- Shopify Polaris-style empty states: explain what belongs in a surface and provide one clear next action when safe.
- Material responsive principles: adapt layout by breakpoint instead of only shrinking desktop UI.
- Restaurant POS and QR ordering workflows: mobile-first customer ordering, scan-friendly status, and large tap targets.

These sources were used only as product/design principles. No external layouts, screenshots, copy, assets, icons, or colors were copied.

## Design Principles

- Use MenuDIGI's blue/navy identity with white cards, slate backgrounds, restrained shadows, and subtle borders.
- Keep simple CRUD forms in centered modals and complex operational details in drawers.
- Preserve route lazy loading, chart lazy loading, PWA behavior, dynamic realtime imports, and Vitest/Playwright separation.
- Keep backend-supported settings honest; do not expose merchant secrets or imply missing features are active.
- Prefer shared component fixes before page-by-page styling.

## Global Design System Refinements

- Buttons now use minimum heights instead of fixed heights, keeping 44px-class tap targets while allowing long Khmer labels to wrap.
- Shared form controls use `khmer-text`/`khmer-label`, 48px minimum input/select height, larger textarea minimum height, and consistent focus rings.
- `AppPageHeader`, `AppCard`, `AppTable`, `AppSheet`, `CrudFormModal`, old UI states, and design-system states were tightened for min-width safety, mobile wrapping, and Khmer label readability.
- Realtime status, language toggle, sidebar links, and navbar popup actions preserve text status and accessible focus behavior.

## Page Shell Improvements

- Admin page headers keep the page h1 in the body, with compact eyebrow/subtitle and wrapping action zones.
- Sidebar groups remain permission-aware and independently scrollable; the workspace helper is now localized.
- Navbar context labels and account menu labels no longer force uppercase/tracking, which improves Khmer readability.

## Landing Improvements

- Landing hero, dashboard mockup, phone mockup, sections, pricing, FAQ, and CTA labels were normalized to Khmer-safe label styling.
- Existing no-fake-metrics approach is preserved: rollout claims remain capability-oriented and pricing remains clearly a planning placeholder.
- No charts or new libraries were added to the landing bundle.

## Auth Improvements

- Login/register keep the centered premium card while improving Khmer label treatment and input tap height.
- Password visibility controls remain keyboard accessible.
- Reset-password copy remains honest: it does not imply a missing backend reset flow exists.

## Admin Shell Improvements

- Sidebar, navbar, account dropdown, notification dropdown, language toggle, and realtime badge keep compact SaaS density with safer Khmer wrapping.
- Notification badge/dropdown continues to use real notification counts and logs only.
- Command/search remains a route/action affordance and does not pretend backend record search.

## Overview Improvements

- Dashboard snapshot and metric labels now avoid forced uppercase and preserve Khmer wrapping.
- KPI/action layout keeps existing architecture, lazy charts, realtime status, refresh state, and empty/error handling.

## Account And Notifications Improvements

- Profile summary, password, preferences, and activity surfaces benefit from the shared controls and label treatment.
- Notification filters/cards/dropdown keep real data, clearer tap targets, retry/empty states, and readable Khmer labels.

## Settings Improvements

- Settings completion card label styling now follows Khmer typography rules.
- Settings keeps only backend-supported fields and honest payment-readiness notes.
- Public QR menu preview and owner-only edit behavior are preserved.

## CRUD Improvements

- Centered `CrudFormModal` keeps sticky save/cancel actions, accessible dialog labels, and mobile-safe viewport bounds.
- Shared table wrapper and form controls improve Products, Categories, Branches, Tables/QR, Shops, Staff, Print Stations, Expenses, Shifts, Kitchen Stations, and Translation editor surfaces where they use the shared primitives.
- No two-column permanent CRUD form layout was introduced.

## Operations Improvements

- Operations drawers inherit improved sheet sizing, safe-area footer behavior, and accessible close/focus treatment.
- Realtime status remains honest, text-based, and tooltip-supported.
- Existing order, kitchen, payment, and proof-review data contracts are unchanged.

## Reports Improvements

- Reports retain lazy chart loading and table/container overflow safety through shared cards/tables.
- No report data model or export behavior changed.

## Customer QR Improvements

- Product cards, product detail sheet, sticky cart, cart, and payment headers/actions avoid forced uppercase and improve Khmer body wrapping.
- Product option labels and quantity/payment controls retain large mobile tap targets.
- Proof preview remains bounded; offline submit blocking is preserved.
- Sticky cart/payment actions still respect safe-area insets.

## Loading, Empty, And Error Improvements

- Shared old UI state components now use Khmer heading/text classes and clearer readable copy containers.
- Design-system empty states remain action-led and checklist-capable.
- App table loading/empty/error surfaces continue to avoid fake data.

## Khmer And I18n Improvements

- Added `nav.workspaceHint` in English and Khmer to remove hardcoded sidebar helper copy.
- Removed forced uppercase/tracking from edited shared labels and page labels.
- Existing product/category/backend names are not translated unless backend data provides those names.

## Responsive And Accessibility Improvements

- Buttons and controls use minimum heights and wrapping text to avoid clipping at 375px/390px/430px.
- Tables remain inside labeled scroll regions.
- Dialog/sheet semantics, aria labels, focus rings, language toggle `aria-pressed`, notification labels, and realtime text status were preserved.
- Statuses remain text-backed and not color-only.

## Performance Protection

- No new UI libraries were added.
- No landing/public chart imports were added.
- Route lazy loading, chart lazy loading, dynamic realtime imports, dynamic SweetAlert2 usage, PWA behavior, and Vite chunk strategy were preserved.

## Tests Added Or Updated

- No behavior-specific tests were added because this pass changed shared styling, wrapping, and copy localization only.
- Existing shared component tests continue to cover button wrapping, accessible cards, modal behavior, empty states, language toggle, navbar, sidebar, and public customer flows.

## Known Limitations And TODOs

- Full visual QA at 375px, 390px, 430px, 768px, 1024px, and 1440px should still be performed on real browsers/devices.
- Some older page-level settings copy remains English-only and should be migrated incrementally to i18n in a later localization-only module.
- No remote GitHub Actions status is implied by local checks.
- Optional Playwright visual/E2E checks should be run when browser stability is confirmed.
