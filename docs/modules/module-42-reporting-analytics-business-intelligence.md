# Module 42 - Reporting, Analytics & Business Intelligence

## Status

Module 42 adds a production-ready reporting and analytics foundation for MenuDIGI while preserving existing order, payment, daily closing, and dashboard workflows.

## Purpose

- Give restaurant owners and managers a deeper view of sales, orders, products, payment methods, branches, and hourly activity.
- Keep analytics backend-calculated, tenant-safe, and role-controlled.
- Avoid fake analytics or cross-tenant data exposure.

## Backend Endpoints

Added authenticated report endpoints:

- `GET /api/reports/summary`
- `GET /api/reports/analytics`
- `GET /api/reports/sales-trend`
- `GET /api/reports/order-status`
- `GET /api/reports/top-products`
- `GET /api/reports/branch-performance`
- `GET /api/reports/hourly-activity`
- `GET /api/reports/export-summary`

Existing daily report endpoints remain:

- `GET /api/reports/sales-summary`
- `GET /api/reports/product-sales`
- `GET /api/reports/payment-methods`
- `GET /api/reports/daily-closing`
- `POST /api/reports/daily-closing`

## Filters

Supported analytics filters:

- `shop_id`
- `branch_id`
- `period`: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `custom`
- `date_from`
- `date_to`
- `payment_status`
- `order_status`

Custom date ranges are limited to 366 days.

## Analytics Service

Added `App\Services\Reports\AnalyticsReportService`.

Responsibilities:

- Apply shop/branch/user scope.
- Normalize frontend-friendly datasets.
- Calculate summary metrics.
- Generate trend, status, product, payment, branch, hourly, and kitchen datasets.
- Keep aggregated report logic out of the controller.

## Metrics

Implemented:

- `total_sales`
- `order_count`
- `average_order_value`
- `pending_orders`
- `completed_orders`
- `cancelled_orders`
- `paid_amount`
- `unpaid_amount`
- `pending_payments`
- `sales_trend`
- `order_status`
- `top_products`
- `payment_methods`
- `branch_performance`
- `hourly_activity`
- `kitchen`

Metric definitions are documented in `docs/analytics/metrics-definitions.md`.

## Permissions

- Backend report access uses existing `canViewReports`.
- CSV export uses existing `canExportReports`.
- Shop owners, managers, and authorized report roles remain scoped to accessible shops and branches.
- Waiters remain blocked by backend role policy.
- Cashier report access remains branch-bound.

## Frontend Reports Page

Updated `/admin/reports` into a broader analytics dashboard:

- Page header with refresh/export actions.
- Shop, branch, period, date range, order status, and payment status filters.
- KPI cards for sales, orders, average order value, paid amount, pending payments, and cancelled orders.
- Honest insight cards for busiest hour, payment review, and completed sales.
- Empty state for no report data.
- Lazy-loaded admin-only charts.
- Branch performance table.

## Charts And Tables

Added:

- `ReportChartCard`
- `SalesTrendChart`
- `OrderStatusBreakdownChart`
- `PaymentMethodsChart`
- `HourlyActivityChart`
- `BranchPerformanceTable`

Existing `TopProductsChart` is reused.

Recharts remains loaded only through lazy admin report/dashboard chunks.

## Dashboard Integration

The admin dashboard now shows a compact analytics snapshot from already-loaded orders:

- Top product from loaded orders.
- Busiest hour from loaded orders.
- Pending payments from loaded orders.
- Link to full reports.

## Export Behavior

`GET /api/reports/export-summary` returns CSV with aggregated summary and top-products data only. It does not export customer names, customer phone numbers, proof paths, provider IDs, or raw payment payloads.

## i18n

Added English and Khmer report keys for:

- Reports and analytics labels.
- Sales, orders, average order value, paid amount, pending payments, cancelled orders.
- Chart titles.
- Date range, period, export, refresh, empty state, filters, busiest hour, and attention labels.

## Tests

Backend:

- Tenant-scoped summary metrics.
- Branch and date filtering.
- Top products aggregation.
- Payment method aggregation.
- Unauthorized role/tenant blocking.
- Empty report payloads.

Frontend:

- Reports page renders filters, KPI cards, and chart sections.
- Clear filters resets optional filters.

## Known Limitations And TODOs

- Preparation-time averages are not calculated because current order item timestamps are not consistently populated for all kitchen states.
- CSV export is intentionally aggregate-only; PDF export is not implemented.
- Advanced comparison analytics and forecasting are not included.
- Reports page uses the existing shop/branch API and will show an empty state until real orders exist.
