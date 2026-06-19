# Analytics Metrics Definitions

MenuDIGI report metrics are calculated on the backend from scoped restaurant data.

## Core Metrics

- `total_sales`: Sum of `grand_total` for completed orders with paid payment status.
- `paid_amount`: Sum of paid payment records in the selected period.
- `unpaid_amount`: Sum of non-cancelled order totals where payment status is not paid.
- `average_order_value`: Non-cancelled order total divided by non-cancelled order count.
- `order_count`: Count of non-cancelled orders in the selected period.
- `cancelled_orders`: Count of orders with `order_status=cancelled`.
- `pending_payments`: Count of payment records with `status=pending`.

## Charts And Breakdowns

- `sales_trend`: Daily completed paid sales and non-cancelled order count.
- `order_status`: Count by order status: pending, accepted, preparing, ready, completed, cancelled.
- `top_products`: Product quantity and revenue from completed paid orders.
- `payment_methods`: Paid, pending, and failed totals grouped by payment method.
- `branch_performance`: Branch sales, order count, average order value, and pending payment count.
- `hourly_activity`: Non-cancelled order count and completed paid sales grouped by hour of day.
- `kitchen`: Kitchen item counts by available kitchen status when order item data exists.

## Scope Rules

- All metrics are scoped to shops and branches the authenticated user can access.
- Public/customer private fields are not included in analytics responses.
- Cancelled orders are excluded from completed sales and average-order calculations.
- Date ranges are limited to 366 days.
