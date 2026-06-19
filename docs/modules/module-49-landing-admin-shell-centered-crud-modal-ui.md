# Module 49 - Landing, Admin Shell & Centered CRUD Modal UI

## Purpose

Module 49 focuses on three targeted UI areas: the landing page conversion layer, the admin sidebar/navbar shell, and CRUD create/edit forms. The goal is a cleaner premium SaaS experience without rebuilding flows or changing backend contracts.

## Inspiration Sources

- Stripe-style consistency for form hierarchy, focus states, and accessible modal structure.
- Vercel-style dashboard navigation for compact grouped sidebar and command trigger behavior.
- Shopify Polaris-style action guidance for empty/no-results list states.
- Modern restaurant QR ordering SaaS patterns for landing CTA clarity and mobile-first explanation.

No external screenshots, layouts, copy, assets, icons, or brand colors were copied.

## Landing Improvements

- Updated primary hero CTA copy to "Get started".
- Updated secondary hero CTA copy to "View QR menu demo".
- Preserved CSS/Tailwind-only phone and dashboard mockups, so landing remains lightweight.
- Kept the sticky landing navbar, language toggle, feature grid, how-it-works flow, pricing, FAQ, and final CTA.
- Preserved the no-fake-metrics rule and did not add testimonials or copyrighted media.

## Sidebar Improvements

- Refined the top logo/workspace block with a premium white card treatment.
- Kept the existing permission-aware route filtering and grouped IA.
- Strengthened active navigation with blue primary styling.
- Increased icon alignment to a consistent 20px visual size.
- Added softer hover treatment and retained visible focus rings.
- Preserved all existing routes and role visibility rules.

## Navbar Improvements

- Replaced the readonly search input with a real command trigger button.
- Kept the honest label: "Jump to page or action".
- Added a mobile command icon button for small screens.
- Preserved contextual eyebrow/title, realtime status, language toggle, notification placeholder, logout confirmation, and dashboard logo links.
- Did not imply backend record search exists.

## Centered CRUD Modal Pattern

Created `frontend/src/design-system/crud/CrudFormModal.jsx`.

The modal provides:

- Centered responsive dialog layout.
- Mobile-safe viewport margins.
- Accessible `role="dialog"`, `aria-modal`, title, and optional description linkage.
- Escape key and overlay close behavior.
- Focus on open and focus return on close.
- Body scroll locking while open.
- Sticky footer with Cancel and Save/Create/Update actions.
- Subtle 180ms fade/scale motion through existing `framer-motion`.
- Configurable max width for simple and larger product forms.

## Pages Converted

- Categories create/edit now opens in `CrudFormModal`.
- Products create/edit now opens in a wider `CrudFormModal` with existing tabs and JSON option helper preserved.
- Branches create/edit now opens in `CrudFormModal`.
- Tables create/edit now opens in `CrudFormModal`.

Order and payment detail drawers were intentionally left drawer-based because they are operational review workflows, not simple CRUD forms.

## Shared Form/Modal UI Improvements

- Kept existing form control heights, labels, helper text, focus rings, upload inputs, and disabled states.
- Added empty-list primary actions where safe for categories, branches, and tables.
- Preserved list-first CRUD pages and did not reintroduce two-column CRUD.
- Product option payload handling remains backend-compatible JSON.

## i18n Additions

Added English and Khmer keys under `crudForms` for:

- Add/edit/create/update product.
- Add/edit category.
- Add/edit branch.
- Add/edit table.
- Required-field and helper-copy labels for product, category, branch, and table forms.

Landing CTA copy was updated in both English and Khmer.

## Accessibility Rules

- CRUD modal has accessible title and description.
- Close button has an accessible name.
- Cancel closes the modal.
- Escape closes the modal.
- Focus returns after close.
- Command trigger is a real button instead of a readonly input.
- Sidebar and navbar focus-visible rings remain intact.

## Mobile Behavior

- CRUD forms use centered responsive modals with safe margins and scrollable bodies.
- Sticky modal footer keeps save/cancel actions reachable.
- Navbar exposes a compact mobile command button.
- Sidebar remains horizontally scrollable on small screens and grouped on desktop.

## Tests Added

- `CrudFormModal` accessible dialog, submit, and cancel behavior.
- Categories add modal open and cancel.
- Products add modal open, tabbed option validation, and cancel.
- Branches add modal open and cancel.
- Tables add modal open and cancel.
- Landing hero CTA and demo CTA copy.
- Sidebar grouping coverage.
- Navbar command trigger and language toggle coverage.

## Performance Protection

- No new UI libraries were added.
- Landing still uses CSS/Tailwind mockups and does not import Recharts.
- Existing route lazy loading, manual chunks, Echo/Pusher separation, SweetAlert2 usage boundaries, and Playwright/Vitest separation were preserved.

## Known Limitations / TODOs

- Unsaved changes confirmation was not added because form dirtiness is not tracked consistently across CRUD pages.
- Product options remain JSON-based to avoid changing backend payload shape.
- Staff, expenses, and settings forms were not converted in this focused pass because their patterns need separate page-specific review.
- Remote GitHub Actions were not checked as part of this local implementation.
