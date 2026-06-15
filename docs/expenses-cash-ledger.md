# Expenses, Cash Ledger, and Accounting Export

Module 28 adds the accounting operations foundation for restaurant, cafe, and club tenants.

## Expense Workflow

- Owners and managers can create expense categories.
- Owners, managers, and cashiers can create expenses.
- Cashiers can only create draft or pending expenses.
- Owners and managers approve or reject expenses.
- Owners, managers, and cashiers can mark an approved or pending expense as paid.
- Paid expenses create append-only cash ledger `expense` entries with direction `out`.
- Receipt image paths are stored only as private operational data and should not be exposed in exports or audit metadata.

## Cash Ledger Concept

The cash ledger is the branch/shop financial event stream. It records cash and payment-impacting events with:

- shop and optional branch
- optional shift
- source type and source id
- entry type
- direction: `in` or `out`
- amount and currency
- safe metadata

Ledger entries are append-only where practical. Corrections should be recorded as future `adjustment` or `refund` entries instead of deleting historical entries.

## Ledger Sources

Current ledger integrations:

- payment confirmed: `payment`, direction `in`
- Bakong KHQR webhook paid: `payment`, direction `in`
- shift opening float: `opening_float`, direction `in`
- shift cash in: `cash_in`, direction `in`
- shift cash out: `cash_out`, direction `out`
- paid expense: `expense`, direction `out`
- shift or daily closing difference: `closing_difference`, direction based on over/short amount

The backend uses source type, source id, and entry type to avoid double-counting the same event.

## Daily Closing and Reports

Sales reports and daily closing now include:

- total paid expenses
- net after expenses
- cash ledger in total
- cash ledger out total
- cash ledger net total
- cash out expenses
- cash in/out movement summary

Daily closing still blocks when open cashier shifts exist.

## CSV Export

`GET /api/cash-ledger/export` returns CSV with:

- date
- branch
- type
- direction
- amount
- currency
- source
- description

Exports intentionally omit receipt image paths, payment proof paths, tokens, and private provider payloads.

## Cambodia Accounting Notes

- Use `KHR` as the default operating currency.
- Keep `USD` support for tourist-heavy restaurants, cafes, and clubs.
- Track ABA PayWay, Bakong KHQR, manual KHQR, bank transfer, and cash separately.
- Cashiers should use shifts for drawer accountability.
- Paid supplier/vendor cash expenses should be entered the same business day so daily closing reflects real cash out.

## Future Accounting Integrations

Recommended future modules:

- formal chart of accounts
- refund and adjustment approval workflows
- PDF accounting reports
- QuickBooks/Xero export mapping
- Cambodia VAT report export
- vendor/supplier master data
- purchase order and inventory costing links
