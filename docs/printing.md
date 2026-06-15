# Thermal Printer and Browser Print Foundation

Module 25 uses browser printing as the production-safe MVP. The backend generates safe print payloads and audit-safe print logs; the browser handles preview and `window.print()`.

## Print Station Concept

Print stations represent where a document should normally print:

- `kitchen`: food preparation tickets
- `bar`: beverage tickets
- `cashier`: cashier counter receipt printer
- `receipt`: customer receipt printer

Stations can be branch-specific or global to all branches. One active default station can be selected per shop, branch, and station type. If no station is configured, print payloads still work and recommend `80mm`.

## Browser Print MVP

Admin users print from:

- Orders: kitchen ticket and receipt
- Invoices: invoice print and paid receipt-style reprint
- Print Stations: station setup and default paper size

The frontend renders dedicated print surfaces for `58mm`, `80mm`, and `A4`. Admin navigation is hidden during print by CSS. Use the browser print dialog to select the physical thermal printer.

Recommended printer setup:

- 58mm: use 58mm roll profile, narrow margins, scale 100%.
- 80mm: use 80mm roll profile, narrow margins, scale 100%.
- A4: use normal page profile for invoice-style output.
- Disable browser headers and footers where possible.

## Kitchen and Cashier Flow

Restaurant/cafe/club workflow:

1. Customer submits an online or table QR order.
2. Staff opens Admin Orders.
3. Waiter/manager/owner prints a kitchen ticket for preparation.
4. Cashier/manager/owner prints a receipt when payment is collected or confirmed.
5. Invoice print is available from Admin Invoices for billing workflows.

Kitchen tickets avoid totals by default. Receipt and invoice payloads include backend-owned totals only.

## Cambodia Notes

The print components support Khmer/English text and compact thermal layouts. Keep product names short for 58mm printers. KHR and USD totals should come from backend billing settings; do not manually edit totals in the frontend.

For ABA PayWay, Bakong KHQR, and manual proof flows, do not print or log private proof file paths. Payment status is safe to show; tokens, authorization headers, and proof storage paths are not.

## Permissions

Backend authorization is the source of truth.

- `super_admin`, `shop_owner`, `manager`: manage print stations and print all document types.
- `cashier`: view cashier/receipt stations and print receipts/invoices.
- `waiter`: view kitchen/bar stations and print kitchen tickets for assigned shops/branches.
- Unknown roles: no print access.

## Logs

`print_logs` records generated print payloads with:

- shop and branch
- user
- printable type and ID
- print type
- print station
- generated status
- safe metadata such as station name, paper size, order number, invoice number, and generated time

Logs must not include passwords, API tokens, full authorization headers, payment proof files, or private storage paths.

## Future ESC/POS Bridge

A later module can add a local printer bridge for direct ESC/POS thermal printing. Recommended direction:

- Local desktop or LAN print agent per branch
- Authenticated short-lived print jobs from the Laravel API
- Queue-backed retry and failed-print tracking
- Printer health heartbeat per station
- ESC/POS formatting isolated from the browser print components

Keep browser printing available as a fallback even after direct printer support exists.
