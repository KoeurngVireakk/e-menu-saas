# Module 31 - MenuDIGI Design System & UX Foundation

## Purpose

Module 31 introduces a reusable frontend design foundation for MenuDIGI. The goal is a clean SaaS interface for admins, a mobile-first QR menu for customers, and fast operational surfaces for staff and kitchen users.

## Installed Libraries

- `lucide-react` for consistent icons.
- `sonner` for non-blocking toast notifications.
- `recharts` for responsive dashboard charts.
- `@tanstack/react-table` for reusable table foundations.
- `@tanstack/react-query` for future data fetching standardization.
- `react-hook-form`, `zod`, and `@hookform/resolvers` for future form validation.
- `cmdk`, `date-fns`, `react-day-picker`, and `qrcode.react` for upcoming command palette, calendar, date, and QR workflows.

`framer-motion` was already present, so no duplicate `motion` package was added. shadcn/ui was not initialized because the project already has custom UI components and a Tailwind v4 setup; the safer path is compatibility wrappers and gradual migration.

## Design Tokens

Design tokens live under `frontend/src/design-system/tokens/`.

- `colors.js`: primary blue, navy text, slate surfaces, border, success, warning, danger, and info colors.
- `typography.js`: app font and common heading/body/label utility strings.
- `spacing.js`: page, card, and stack spacing conventions.
- `radius.js`: shared radius values.
- `shadows.js`: subtle shadow presets.

## Components

Reusable components live under `frontend/src/design-system/components/`.

- `AppButton`: variants, loading state, disabled state, icons, and full-width support.
- `AppCard`: card surface with optional title, description, and action area.
- `AppBadge` and `AppStatusBadge`: shared status badge mapping.
- `AppTable`: TanStack Table wrapper with sorting, loading, empty state, and row actions.
- `AppDialog` and `AppSheet`: accessible modal and side-panel wrappers.
- `AppEmptyState`: reusable empty state with optional action.
- `AppSkeleton`: page, table, card, and product-grid loading skeletons.
- `AppPageHeader`: page title, description, breadcrumbs, and actions.
- `AppMetricCard`: dashboard metric card with icon and trend support.
- `AppFilterBar`: filter toolbar wrapper.

## Motion Rules

Motion variants live under `frontend/src/design-system/motion/`.

- Keep durations between 150ms and 300ms.
- Use subtle fade/slide/scale transitions.
- Avoid heavy animation in admin tables.
- Motion should enhance feedback, not communicate required state by itself.

## Toast And Alert Rules

Sonner is used for normal operational feedback:

- Saved successfully.
- Product created.
- Order updated.
- Payment confirmed.
- New order received.
- Connection restored.

SweetAlert2 remains for blocking or destructive flows:

- Delete product.
- Cancel order.
- Reject payment.
- Logout confirmation.
- Close shift.
- Irreversible actions.

## Chart Rules

Chart components live under `frontend/src/design-system/charts/`.

- `ChartCard`
- `SalesLineChart`
- `OrderStatusChart`
- `TopProductsChart`
- `PaymentMethodChart`

Charts accept props and use safe empty/demo fallback data only when no data is provided for rendering stability. Production pages should pass real API data.

## Pages Improved

- Admin dashboard now uses the design system, metric cards, chart cards, quick actions, realtime status, and an automation insight placeholder.
- Admin layout spacing and background were tightened.
- Sidebar uses Lucide icons and blue active states.
- Navbar uses a cleaner user/account area and design-system button.
- Customer product cards and cart drawer now use the design-system button, badge, and empty-state primitives.

## Automation UX Placeholder

`frontend/src/components/automation/AutomationInsightCard.jsx` supports future product insights, low-stock alerts, daily closing reminders, peak-hour suggestions, and branch performance prompts.

## Accessibility Checklist

- Buttons should have visible focus states.
- Icon-only buttons need `aria-label`.
- Dialogs need titles and `aria-modal`.
- Status must include text, not icons alone.
- Color contrast should meet readable slate/blue/green/amber/rose combinations.
- Motion is optional and should not be required to understand the UI.

## Responsive Rules

- Customer QR menu remains mobile-first, especially around product cards and cart actions.
- Admin pages use card grids that collapse to single-column on mobile.
- Kitchen screens should prioritize large text, high contrast, and large action buttons.
- Review common sizes: 375px, 768px, 1024px, and 1440px.

## Future Usage

New modules should import from `frontend/src/design-system/components` first. Existing custom UI components remain supported, but new shared patterns should prefer the design-system wrappers to avoid duplicated colors, badge logic, card styles, and button variants.
