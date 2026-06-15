# Shift Management and Cash Drawer Sessions

Module 27 adds cashier shift tracking for branch-level cash reconciliation.

## Cashier Shift Workflow

1. Cashier selects shop and branch.
2. Cashier opens a shift with an opening float.
3. During the shift, cash in/out movements can be recorded.
4. Cash payments confirmed by the cashier during the open shift are counted toward expected cash.
5. Cashier enters counted cash when closing the shift.
6. Backend calculates expected cash and cash difference.
7. Shift report can be printed from the admin page.

Only one open shift per cashier per branch is allowed.

## Opening Float

`opening_float` is the cash drawer amount at the beginning of the shift. It is included in expected cash:

`expected_cash_total = opening_float + cash_payment_total + cash_in_total - cash_out_total`

The frontend never calculates trusted totals.

## Cash In/Out Movements

Cash movements are stored in `cash_movements`.

- `cash_in`: increases the drawer total
- `cash_out`: decreases the drawer total

Each movement requires a positive amount and reason. Notes are optional. Movement logs should include safe totals and IDs only.

## Closing Cash Count

At close, the cashier enters `counted_cash_total`. Backend calculates:

`cash_difference = counted_cash_total - expected_cash_total`

Positive differences indicate overage. Negative differences indicate shortage.

## Branch-Level Cash Handling

Shifts belong to a shop, branch, and user. Branch-scoped staff can only access assigned branch shifts. Managers and owners can view branch shift history and close/cancel shifts when needed.

## Daily Closing Integration

Daily closing now includes shift summary information and blocks closing when open shifts exist for the selected shop/branch/date. Close all cashier shifts before creating the daily closing record.

## Permissions

Backend authorization is the source of truth.

- `super_admin`, `shop_owner`, `manager`: view/manage shifts, close/cancel shifts, add movements.
- `cashier`: open/close own shifts and add movements to own open shift.
- `waiter`: no cash drawer shift access.

Frontend permission checks only improve UX.

## Audit and Security Notes

Audit logs are written for:

- `shift.opened`
- `shift.cash_in`
- `shift.cash_out`
- `shift.closed`
- `shift.cancelled`

Do not log payment proof paths, tokens, authorization headers, or private payment details. Safe cash totals, IDs, branch IDs, shift codes, and movement reasons are acceptable.

## Future Cash Drawer Hardware Integration

Recommended future work:

- Cash drawer open command through local printer bridge
- Shift-level receipt printer summary
- Supervisor approval for large cash out movements
- Reopen shift workflow with audit trail
- Cash drawer hardware heartbeat
- Accounting export for drawer over/short records
