# Module 56 — Premium Overview Dashboard UI & UX Upgrade

## Purpose

Upgrade /admin from a general dashboard into a focused Overview page that answers three questions quickly:

- What happened today?
- What needs attention?
- What should I do next?

## Inspiration sources

The implementation uses SaaS dashboard principles inspired by Vercel workflow prioritization, Stripe-style restraint and consistency, Shopify Polaris-style empty-state guidance, analytics dashboards, and restaurant POS/kitchen operation screens. No external layouts, brand assets, copy, colors, screenshots, or icons were copied.

## Dashboard UX principles

- Prioritize real operational state before secondary analytics.
- Keep the route /admin stable while using the clearer “Overview” label.
- Preserve existing order/shop response shapes and avoid fake data.
- Keep charts lazy-loaded and admin-scoped.
- Keep Khmer copy readable with natural wrapping and comfortable line height.

## Layout sections

1. Page hero with Overview eyebrow, Today’s Operations title, refresh, reports, live status, last-updated, and refetch state.
2. KPI summary row with sales, orders, average order value, pending payments, kitchen queue, and completed orders.
3. Setup checklist near the top only when shop/order setup still needs visible guidance.
4. Needs Attention panel with problem, impact, and one action per item.
5. Quick Actions grid for common owner/staff workflows.
6. Operations Snapshot with recent orders, pending payments, and kitchen queue.
7. Analytics Preview with lazy Sales trend, Order status, and Top products charts.
8. Secondary analytics snapshot and shop portfolio.

## KPI improvements

- AppMetricCard now supports stable card height, better skeletons, icon slots, helper text, tone/status styling, accessible labelling, and optional action links.
- KPI cards avoid fake trend percentages and only show values from loaded data.
- Empty and zero states use explicit helper copy instead of implying missing data is a success metric.

## Needs-attention improvements

- Added NeedsAttentionPanel.
- Items show the problem, why it matters, status tone, and one clear action.
- Empty state says everything looks good only when no visible urgent item exists in loaded data.

## Quick actions

- Added QuickActionsGrid.
- Actions link only to existing admin routes.
- Visibility is permission-aware through existing role permissions.

## Recent operations

- Added RecentOrdersPanel, PendingPaymentsPanel, and KitchenQueuePanel.
- Panels show 3–5 scannable items, text status badges, safe operational details, empty states, and action links.
- Customer private data is not surfaced beyond existing order identifiers, branch, amount, and statuses.

## Analytics preview

- Uses existing lazy chart components.
- Chart cards include title, explanation, loading state, empty state, and reports links.
- Recharts imports remain inside lazy chart modules.

## API perceived-speed UI

- Existing React Query placeholderData behavior is preserved.
- Initial load uses skeletons; refetch keeps previous dashboard data visible.
- Manual refresh shows “Refreshing overview...” and last updated time.
- Error handling supports retry without blanking existing data when previous data exists.

## i18n improvements

- Added English and Khmer overview keys for hero, periods, KPIs, needs attention, quick actions, operations panels, charts, empty states, refresh/retry, and last-updated copy.
- Updated dashboard page title/subtitle to Overview / Today’s restaurant operations at a glance.

## Responsive improvements

- KPI grid supports mobile, tablet, desktop, and wide desktop without horizontal overflow.
- Quick actions move from one column to multi-column layouts by breakpoint.
- Operations panels stack cleanly on mobile and split on desktop.
- Chart cards remain bounded with safe overflow.

## Accessibility improvements

- Dashboard keeps one main h1.
- Major panels use section headings and labelled cards.
- Statuses use text badges, not color alone.
- Loading and refreshing states expose text/status semantics.
- Links and buttons use readable labels and visible focus styles.

## Tests added/updated

- Overview heading and subtitle render.
- KPI labels render.
- Needs-attention items render with action links.
- Quick actions render valid links.
- Recent orders empty state renders.
- Reports link exists.
- Refreshing status renders during manual refetch while data remains visible.
- Khmer title/subtitle render.
- Dashboard keeps one h1.

## Known limitations / TODOs

- The dashboard does not currently receive authoritative product, category, branch, or table counts, so it does not claim low/no product or table counts outside the existing setup checklist guidance.
- Chart summaries are based on the loaded dashboard order data. Full scoped analytics remain in Reports.
- Future backend dashboard endpoints could provide explicit today/this-week/this-month aggregates, product counts, table counts, delayed kitchen timers, and richer attention rules.
