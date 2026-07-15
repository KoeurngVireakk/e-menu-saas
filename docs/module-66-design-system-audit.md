# Module 66 — MenuDIGI design-system audit

## Executive summary

MenuDIGI already had a useful shared component layer, but two parallel families had started to drift: `frontend/src/design-system/` and `frontend/src/components/ui/`. Equivalent buttons, badges, page headers, states, fields, and overlays did not always share sizes, radii, focus treatment, loading behavior, or semantic status colors.

Module 66 makes `frontend/src/design-system/` the canonical contract and keeps small compatibility wrappers where immediate page migration would be risky. It does not redesign page information architecture, merge different overlay purposes, or replace every page-level class.

The implemented contract is:

- 44px default interactive controls, 40px compact controls, and 48px large controls.
- `rounded-2xl` controls, `rounded-3xl` cards and overlays, and full-radius badges.
- Blue/navy brand actions; semantic success, warning, danger, information, and neutral states.
- One visible focus treatment and non-color status dots.
- Khmer-aware font, wrapping, and line-height rules inherited by every shared primitive.
- Subtle card elevation, stronger elevation only for overlays, and no new brand palette.

## Audit scope and evidence

Source audit covered:

- `frontend/src/design-system/`
- `frontend/src/components/ui/`
- `frontend/src/components/common/`
- `frontend/src/components/`
- `frontend/src/layouts/`
- repeated patterns in admin, public, and landing pages
- `frontend/src/index.css`

The in-app browser could not initialize during the initial audit, so no pre-change screenshots are claimed as audit evidence. Responsive verification is handled by the repository's existing visual Playwright test, which covers 375, 430, 768, 1024, and 1440 widths. This document separates source-confirmed behavior from visual checks for that reason.

## Current shared inventory

| Area | Canonical or retained components | Contract |
| --- | --- | --- |
| Actions | `AppButton`, compatibility `Button`, `ConfirmButton` | primary, secondary, outline, ghost, danger, link; retained success/dark aliases; small, medium, large, icon sizes; stable loading content |
| Badges and status | `AppBadge`, `AppStatusBadge`, compatibility `Badge` and `StatusBadge` | semantic tone mapping and a non-color status dot |
| Surfaces | `AppCard`, `AppMetricCard`, legacy layoutless `Card`, `ChartCard` variants | default, interactive, bordered, elevated, and compact surfaces |
| Headers | `AppPageHeader`, compatibility `PageHeader`, `SectionTitle` | shared Khmer-aware title, subtitle, eyebrow, and action hierarchy |
| Data display | `AppTable`, retained DataTables-backed `DataTable`, `RowActionsMenu`, `AppPagination` | safe horizontal overflow, accessible labels, grouped row actions, minimum-size pagination actions |
| Filters and selection | `AppFilterBar`, `CrudToolbar`, `SearchInput`, `StatusTabs`, `OperationStatusTabs`, `DataViewToggle`, `Tabs` | wrapping toolbars, labeled search, clear search action, selected state, keyboard tab navigation |
| Forms | `Field`, `TextInput`, `SelectInput`, `TextArea`, `FileInput`, `ToggleField`, compatibility `Input`, `Select`, `Textarea` | shared height, radius, focus, disabled/read-only, helper, error, upload, and toggle behavior |
| Overlays | `Modal`, `AppDialog`, `CrudFormModal`, `AppSheet`, `CreateEditDrawer` | shared overlay token, Escape, outside click, focus trap/restoration, scroll lock, safe areas |
| Application states | `AppState`, `AppEmptyState`, `AppSkeleton`, UI state compatibility exports | first load, empty, no results, permission, offline, recoverable error, and success structures |
| Feedback | Sonner `ToastProvider`, SweetAlert-backed confirmation helpers | semantic feedback, accessible close/cancel, consistent typography and radius |
| Motion | Framer Motion plus `prefers-reduced-motion` CSS | 150–220ms interactions, no new animation library, reduced-motion fallback |

## Duplicate patterns found and disposition

| Duplicate | Finding | Module 66 disposition |
| --- | --- | --- |
| `AppButton` and `components/ui/Button` | Same purpose with different variants, weights, and no shared loading API | `Button` now delegates to `AppButton` |
| `AppPageHeader` and `components/ui/PageHeader` | Orange vs blue eyebrow and different Khmer/spacing rules | `PageHeader` now delegates to `AppPageHeader` |
| `AppBadge`, UI `Badge`, and `StatusBadge` | Color-name tones conflicted with status semantics; live states relied on color/pulse | Compatibility components now route through semantic `AppBadge` / `AppStatusBadge` |
| `AppEmptyState`, UI state components, and `PublicEmptyState` | Three structures with different actions, error copy, and motion | Shared `AppState` is the base; compatibility wrappers retain existing APIs |
| `Modal` and `AppDialog` | Equivalent centered dialogs with different IDs and missing behavior in `AppDialog` | `AppDialog` now delegates to `Modal` |
| `Modal`, `CrudFormModal`, and `AppSheet` behavior | Escape, focus, and body lock were reimplemented and none trapped focus | Shared `useDialogA11y` behavior; visual purposes remain separate |
| UI inputs and CRUD form controls | 48px vs 40px height, duplicated helper/error styling | Shared form style and feedback modules; APIs retained |
| `StatusTabs` and `OperationStatusTabs` | Different containers and selected states for the same filter interaction | Aligned visual/interaction contract; kept separate data APIs |
| Local admin action buttons | Repeated 36px `rounded-md`/`rounded-xl` buttons | Safe replacements in products, tables, shifts, expenses, and daily closing |
| `AppTable` and DataTables `DataTable` | Different table libraries and pagination behavior | Both retained; legacy wrapper now shares surface, state, focus, and pagination styling |

## Token standard

Tokens live in `frontend/src/index.css` and are mirrored where JavaScript chart configuration needs literal values.

| Token | Meaning |
| --- | --- |
| `--menudigi-primary` / `--menudigi-primary-hover` | primary action and hover |
| `--menudigi-navy` / `--menudigi-muted` | strong and secondary text |
| `--menudigi-page-bg` / `--menudigi-card-bg` | page and surface backgrounds |
| `--menudigi-border` | default subtle border |
| `--menudigi-success*` | completed, paid, active, available, ready |
| `--menudigi-warning*` | preparing, pending, attention |
| `--menudigi-danger*` | rejected, failed, overdue, cancelled, destructive |
| `--menudigi-info*` | new, processing, selected, accepted |
| neutral slate | disabled, inactive, unknown, unpaid |
| `--menudigi-focus-ring` | shared keyboard focus color |
| `--menudigi-card-shadow` | default subtle surface shadow |
| `--menudigi-elevated-shadow` | dialogs and sheets only |
| `--menudigi-overlay` | modal/sheet backdrop |

Equivalent statuses must use these semantic roles. Page-specific product colors remain allowed only when they represent product or chart data rather than status.

## Typography standard

Font stack is preserved as:

`Inter, "Noto Sans Khmer", "Khmer OS Battambang", system-ui, sans-serif`

Shared roles are defined for page title, page subtitle, section eyebrow, section title, body, helper, field label, table heading, badge, button, and metric value.

Khmer rules are enforced at the document level and in shared primitives:

- no uppercase transform or letter spacing;
- body line-height 1.75 and heading line-height 1.4;
- button and label text can wrap;
- fields and buttons use minimum heights instead of fixed heights;
- file, helper, validation, and state copy use Khmer-aware classes.

## Interaction and accessibility standard

- Buttons keep their original content in layout while a centered loading spinner appears, preventing width changes.
- Disabled controls are not represented by opacity alone; they receive neutral background, border, text, and cursor treatment.
- Form errors use `aria-invalid`, `aria-describedby`, `role="alert"`, text, and an icon.
- Required controls retain the native `required` state and a visible asterisk.
- File inputs announce the selected filename.
- Toggles use a native checkbox with a larger labeled target and visible focus.
- Status badges include a dot so meaning is not conveyed only by foreground/background color.
- Filter groups expose `aria-pressed`; tabs expose selected state and arrow-key navigation.
- Dialogs and sheets trap focus, close with Escape when allowed, restore prior focus, lock body scroll, and respect mobile safe areas.
- Loading skeletons expose status labels and stop animation for reduced-motion users.
- Error states use a precise default title and retain caller-provided failure detail; generic “Something went wrong” is no longer the shared default.

## Components changed

- Design tokens: CSS color, focus, shadow, overlay, radius, and typography roles.
- Actions: `AppButton`, UI `Button`, `ConfirmButton`, confirmation alert configuration.
- Status: `AppBadge`, `AppStatusBadge`, UI `Badge`, `StatusBadge`.
- Surfaces: `AppCard`, `AppMetricCard`, DataTables wrapper styling.
- Forms: CRUD controls, UI input/select/textarea, `SearchInput`, upload and toggle behavior.
- Selection: tabs, status filters, operation filters, data-view toggle.
- Overlays: `Modal`, `AppDialog`, `CrudFormModal`, `AppSheet`, and shared dialog behavior.
- States: new `AppState`, updated empty/error/loading variants, public empty-state compatibility.
- Data: new `AppPagination`, accessible row-action grouping, DataTables pagination CSS.
- Feedback: toast and confirmation presentation.
- Safe page migrations: product/table local actions and filters; shift, expense, and daily-closing row actions.

## Components intentionally left untouched

- Chart implementations and chart-specific colors: they represent quantitative series, not status.
- `KitchenOrderCard`, timelines, order/payment detail content: operational information architecture belongs to later screen modules.
- Cart `Drawer`: it is a persistent summary, not a modal sheet.
- Navbar account dropdown and notification panel: they have different disclosure UX and data behavior; merging them with dialogs would be incorrect.
- DataTables internals: several legacy pages rely on plugin sorting and paging. Replacing it with TanStack Table would be a broader data-layer migration.
- Landing preview cards and public product cards: those surfaces are page-specific visual storytelling, not shared admin primitives.
- Brand preview colors entered by a shop: those are customer brand data, not MenuDIGI status colors.

## Missing or deferred primitives

- A true dropdown action-menu primitive with roving keyboard focus. `RowActionsMenu` remains an accessible action group because current rows expose a small number of visible actions.
- Server-wired numeric pagination. `AppPagination` defines the UI contract, but each endpoint needs page metadata and query-state integration.
- A unified table implementation. `AppTable` and the DataTables wrapper coexist until feature parity and migration cost are assessed.
- A dedicated disabled-action explanation/tooltip. Current actions should continue using visible helper text or the native `title` only where already present.
- Automated contrast and 200% zoom assertions. These need browser-level visual/accessibility verification.

## Follow-up issues for Module 67

1. Migrate remaining legacy admin pages from UI compatibility components to direct design-system imports while preserving their business logic.
2. Decide whether DataTables should be retired in favor of `AppTable`; migrate one page first and verify sorting, pagination, and responsive behavior.
3. Add a keyboard-complete account/action dropdown primitive and apply it to the navbar only after its notification and account flows are tested separately.
4. Wire `AppPagination` to reviews, notifications, and other server-paged endpoints with localized summaries.
5. Run a screenshot-based contrast, 200% zoom, and long-Khmer-copy audit once the in-app browser capture path is available.
6. Review remaining page-local loading blocks and move only repeated shapes to named `AppSkeleton` variants.
7. Localize shared fallback copy and labels that are still English-only.

## Acceptance notes

No backend logic, route information architecture, or business data flow is changed. No new dependency or animation library is added. No commit or push is part of Module 66 until all required checks pass and the user explicitly requests publishing.

## Verification record

Verified on 2026-07-15:

- `npm run lint`: passed.
- `npm run test`: passed, 74 test files and 160 tests.
- `npm run build`: passed; Vite production output and PWA service worker were generated successfully.
- `npm run test:visual`: passed, one Playwright responsive visual scenario.
- Visual artifacts were reviewed at 375, 390, 430, 768, 1024, and 1440px. Admin settings, account navigation, public Khmer menu content, and the landing route remained within their responsive layouts; no horizontal clipping was observed in the reviewed states.
- `npm run test:e2e -- --grep "design system|modal|navigation"`: no matching E2E tests exist, so Playwright exited with `No tests found`. Modal focus management and keyboard navigation are covered by focused Vitest component tests; the repository still needs a named browser-level scenario for this grep.
- `git diff --check`: passed. Git emitted only the repository's LF-to-CRLF working-copy notices.
- `git status --short -- backend`: clean; no backend file changed.

The initial in-app browser capture path failed to initialize, so Module 66 does not claim pre-change screenshot comparisons or automated 200% zoom/contrast coverage.
