# Module 55 — Real-Device UX QA, Khmer Font Polish, and Mobile Hardening

## Purpose

Module 55 is a focused QA and polish pass after Module 54. It hardens shared responsive primitives, Khmer typography, mobile safe areas, customer ordering actions, admin sheets, chart bounds, and automated browser coverage without changing backend contracts, routes, business logic, realtime behavior, or the centered CRUD pattern.

## Routes and breakpoints reviewed

Playwright exercises `/`, `/login`, `/register`, `/admin`, `/admin/products`, `/admin/reports`, `/menu/menudigi-e2e-cafe`, `/cart`, and `/payment/E2E-ORDER` with deterministic API fixtures. The shared components used by categories, branches, tables, orders, payments, kitchen, settings, customer product detail, and order success were also code-audited and covered by Vitest where practical.

Screenshot artifacts cover widths 375, 390, 430, 768, 1024, and 1440 px. These are browser viewport simulations, not claims of testing on physical iOS or Android hardware.

## Khmer font findings

- `Khmer OS Battambang` is now first in the active Khmer-language stack, followed by `Noto Sans Khmer`; no font binaries were added.
- Khmer headings, labels, buttons, descriptions, empty states, customer headers, payment copy, and success copy use the shared Khmer typography helpers.
- Khmer helpers enforce comfortable line height, remove letter spacing, and allow long strings to wrap. Khmer mode continues to neutralize forced uppercase/tracking.

## Safe-area and responsive improvements

- Added `viewport-fit=cover` so CSS environment insets work on notched devices and installed PWA surfaces.
- CRUD modal and base modal overlays account for top, left, right, and bottom insets; sticky footers keep actions above the bottom inset.
- Operation/admin sheets use `100dvh`, contain horizontal overflow, preserve internal scrolling, and protect header/footer safe areas.
- Mobile sidebar width is bounded to the viewport and its top/bottom content respects device insets.
- Admin shell uses dynamic viewport minimum height and clips page-level horizontal overflow.

## Customer QR mobile improvements

- Sticky cart content and its action stack at narrow widths, use full-width mobile actions, and respect left/right/bottom insets.
- Category tabs retain a minimum 44 px tap target.
- Shop headers respect the top inset and apply Khmer wrapping helpers.
- Cart checkout actions remain visible above the bottom inset without leaving a permanent oversized gap on larger screens.
- Payment proof previews are bounded by both width and dynamic viewport height.
- Cart, payment, loading/error, and order-success layouts use dynamic viewport height and safe bottom padding.
- Product detail actions remain stacked on mobile and protected by the bottom safe area; required-option behavior and payloads are unchanged.

## Admin mobile and CRUD improvements

- Navbar remains bounded at narrow widths with mobile command access and viewport-sized popovers from Module 54.
- Sidebar remains independently scrollable, now with inset-aware mobile padding and a bounded drawer width.
- CRUD toolbars remain single-column first and wrap at larger widths; simple CRUD continues to use centered modals.
- CRUD modal body scroll and footer actions are independently reachable at short dynamic viewport heights.
- Report/chart containers now have zero-minimum width and hidden overflow; Recharts containers receive an explicit `minWidth` safeguard.

## Loading, empty, error, and accessibility

- Shared empty-state titles, descriptions, and checklists use Khmer-safe wrapping; mobile actions remain full width.
- Existing public skeleton, offline, error, retry, and validation behavior was preserved.
- Dialog and sheet titles/descriptions remain programmatically associated; close and quantity controls retain accessible labels.
- Table horizontal scroll regions remain keyboard focusable and explicitly labeled.
- Status components continue to expose text rather than color alone.

## Tests and validation

- Added a product-detail sheet regression test for action stacking, safe-area padding, and localized quantity labels.
- Updated CRUD modal, base modal, app sheet, sidebar, sticky cart, cart checkout, and empty-state tests for the hardened layout contracts.
- Expanded Playwright visual artifacts to all six requested viewport widths.
- Vitest and Playwright collection remain explicitly separated in `vite.config.js`.
- Baseline and final commands cover Laravel parallel/serial tests, route listing, frontend lint/Vitest/build, Playwright E2E/visual, and `git diff --check`.

## Known limitations and TODOs

- Physical iPhone/Android testing is still required for OS-specific Khmer glyph metrics, browser chrome resize behavior, keyboard overlap, and notch/home-indicator behavior.
- Browser fixtures directly cover the primary landing, auth, shell, products, reports, menu, cart, and payment paths. Manually review categories, branches, tables, orders, payments, kitchen, settings, and order success with representative long Khmer data.
- Khmer OS Battambang remains dependent on local OS availability; Noto Sans Khmer is the configured fallback and no licensed font package is bundled.
- Playwright screenshot artifacts are generated under ignored test output and are not committed as large binary assets.
