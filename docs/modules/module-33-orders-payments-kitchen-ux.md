# Module 33 - Orders, Payments, and Kitchen Operations UX

## Purpose

Module 33 upgrades the core restaurant operations screens into a professional, list-first SaaS/POS workflow. The focus is operational speed, readable status, clean filtering, safe confirmations, and drawer-based details without changing the existing Laravel business flows.

## Pages Improved

- `/admin/orders`
- `/admin/payments`
- `/admin/kitchen`
- Order detail drawer
- Payment proof review drawer
- Kitchen order cards

## Old UX Problems

- Operational pages were harder to scan under active restaurant load.
- Important filters and status navigation were not visually consistent across orders, payments, and kitchen.
- Detail review patterns varied by page.
- Kitchen cards needed larger tap targets and clearer item grouping for tablet use.

## New Operations UX Pattern

- Page header with operational description and refresh action.
- Status tabs for fast queue filtering.
- Search and filter toolbar.
- List/table/card primary content.
- Right-side detail drawer for review and actions.
- SweetAlert2 confirmation for important state changes.
- Sonner toast feedback after successful updates.
- Skeleton, empty, and error states through the design system.

## Orders UX

- Status tabs: All, Pending, Accepted, Preparing, Ready, Completed, Cancelled.
- Search by order number, table, customer, phone, or branch.
- Filters for branch, payment status, and order date.
- Professional order table with order, table/branch, customer, item count, total, payment status, and order status.
- Order drawer includes summary, customer/table info, item list, status actions, print/document actions, and timeline-ready status area.
- Cancel actions require stronger confirmation.

## Payments UX

- Status tabs: All, Pending, Paid, Confirmed, Failed, Rejected, Refunded.
- Search by order number, transaction reference, customer, phone, or method.
- Filters for method and date.
- Payment review table shows method, provider, amount, reference, status, and failure reason where available.
- Payment drawer includes linked order summary, amount, reference, provider metadata, proof image preview, review actions, and timeline-ready logs.
- Confirm and reject flows remain protected by existing permissions and confirmation prompts.

## Kitchen UX

- Large tablet-friendly kitchen cards.
- Status tabs: All, New, Accepted, Preparing, Ready, Completed, Cancelled.
- Cards show order number, table/branch, elapsed time, payment status, order status, notes, and grouped items.
- Large action buttons support accept, start preparing, mark ready, and complete.
- Realtime status badge remains visible when a branch subscription is active.
- New order cards receive a subtle slide/fade transition and highlighted border.

## Shared Components

- `OrderStatusBadge`
- `PaymentStatusBadge`
- `OperationStatusTabs`
- `OperationTimeline`
- `OrderItemsList`
- `OrderDetailDrawer`
- `PaymentDetailDrawer`
- `KitchenOrderCard`

## Animation Rules

- Use subtle Framer Motion transitions only where they improve comprehension.
- Keep motion between 150ms and 300ms.
- Avoid heavy animation in tables and operational queues.
- Status changes must be understandable without animation.

## Accessibility Checklist

- Statuses are rendered as text, not color-only.
- Drawer panels have accessible labels from their titles.
- Payment proof images include descriptive alt text.
- Kitchen actions use real buttons with large tap targets.
- Filter inputs and selects have labels or accessible names.
- Empty and loading states include readable text.

## Manual Review Routes

- `/admin/orders`
- `/admin/payments`
- `/admin/kitchen`

## Known Limitations / TODOs

- Export buttons are not added until backend export endpoints are available.
- Payment refund is shown as a filter-ready status only if records use it.
- Order and payment timelines use existing event/log fields and are ready for richer audit timelines later.
- Kitchen realtime depends on the existing Reverb/Echo setup and authenticated branch channel access.
