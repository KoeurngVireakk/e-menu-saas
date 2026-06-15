# Reports and Daily Closing

Module 26 adds backend-owned sales reports and daily closing records for restaurant, cafe, and club operations.

## Report Definitions

Sales reports are calculated from stored orders, order items, and payments. The frontend never calculates trusted totals.

- `total_orders`: all orders matching the filters.
- `completed_orders`: orders with `order_status=completed`.
- `cancelled_orders`: orders with `order_status=cancelled`.
- `gross_sales`: completed paid order subtotal plus discount total.
- `discount_total`: completed paid order discounts.
- `service_charge_total`: completed paid order service charges.
- `tax_total`: completed paid order tax/VAT.
- `net_sales`: completed paid order grand total.
- `paid_total`: non-cancelled paid order grand total.
- `unpaid_total`: non-cancelled unpaid or pending order grand total.

Best-selling products use completed paid orders only and return the top 10 products by quantity sold.

## Payment Method Rules

Payment reports group confirmed paid payment records by method:

- `cash`
- `khqr_manual`
- `bakong_khqr`

Pending and failed totals are also returned so operators can reconcile unsettled or rejected payments. Private proof image paths, QR payload internals, tokens, and authorization headers must not appear in report responses or logs.

## Daily Closing Workflow

1. Select shop, branch, and date.
2. Backend calculates sales and payment totals.
3. Cashier or manager enters counted cash.
4. Backend calculates `cash_difference = counted_cash_total - expected_cash_total`.
5. Closing record is saved with the calculated summaries.
6. Duplicate closed records for the same shop, branch, and date are blocked unless explicit reopen behavior is added later.
7. An audit log is written for the closing event.

`expected_cash_total` is based on confirmed paid cash payments for the selected day.

## Permissions

Backend authorization is the source of truth.

- `super_admin`, `shop_owner`, `manager`: view/export reports and close days.
- `cashier`: view and close assigned branch reports only.
- `waiter`: no financial report access.

Frontend permission checks only improve UX; they do not replace backend authorization.

## Branch-Level Reporting

Reports accept `shop_id`, `branch_id`, `date`, `date_from`, `date_to`, `payment_status`, and `order_status` filters. Branch-scoped staff are limited by their active assignments.

For whole-shop closings, `branch_id` can be omitted by owners/managers. Cashiers must provide an assigned branch.

## Cambodia Notes

Primary currency should be KHR unless a shop is configured otherwise. USD secondary totals are reported when stored on orders. ABA PayWay, Bakong KHQR, cash, and manual KHQR operations should be reconciled separately because settlement timing can differ by provider.

## Print and Export

The browser print foundation supports:

- sales report print
- daily closing print
- product sales CSV export for owner/manager roles

Future PDF/Excel exports should be generated server-side for consistency and auditability.

## Future Accounting Integration

Recommended next steps:

- Daily closing reopen approval flow
- Shift-based cashier sessions
- Expense and cash-in/cash-out records
- Excel/PDF export queue
- Accounting export mapping for local bookkeeping
- ABA PayWay settlement import
- Bakong settlement reconciliation
