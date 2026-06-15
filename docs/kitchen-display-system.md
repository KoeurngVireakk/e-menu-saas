# Kitchen Display System

Module 29 adds a branch-aware kitchen display workflow for restaurants, cafes, and clubs.

## Kitchen Workflow

Orders submitted from the public menu appear in `/admin/kitchen` as `pending`.

Order statuses:

- `pending`
- `accepted`
- `preparing`
- `ready`
- `completed`
- `cancelled`

Item statuses:

- `pending`
- `preparing`
- `ready`
- `served`
- `cancelled`

Kitchen staff can start items, mark items ready, and mark the whole order ready. Waiters, cashiers, managers, owners, and super admins can update kitchen order flow according to their assigned branch access. When all active items are ready, the order moves to `ready`; when all active items are served, the order moves to `completed`.

## Sound Alerts

The KDS polls the API every 7 seconds. When a new order appears after the initial load, the frontend:

- highlights the new order card
- plays a short browser-generated beep if sound is enabled
- avoids repeated sound for the same order id
- stores mute preference in `localStorage`

Browsers may block sound until the user interacts with the page. If that happens, the page shows an `Enable sound` button.

## Station And Category Routing

Kitchen stations can be configured inside `/admin/kitchen`.

Stations support:

- shop and optional branch
- type: `kitchen`, `bar`, `dessert`, or `general`
- assigned product categories
- active/inactive status

The KDS station filter shows orders containing products assigned to that station's categories. Stations without category assignments act as general stations.

## Branch Screens

Branch filters keep kitchen screens tenant-aware and branch-aware. Cashiers and waiters should use their assigned branch screen. Owners and managers can view all accessible branches.

## Permissions

- `super_admin`, `shop_owner`, `manager`: full kitchen and station access
- `cashier`: view kitchen and update kitchen order flow
- `waiter`: view kitchen and update served/completed flow
- unknown roles: no kitchen access

Backend authorization remains the source of truth. Frontend permissions only improve the user experience.

## Events And Audit Logs

Kitchen events are stored for item/order workflow changes:

- `order_received`
- `item_preparing`
- `item_ready`
- `order_ready`
- `item_served`
- `order_served`
- `cancelled`

Audit logs are created for important kitchen actions and station changes. Payment proofs, tokens, and private financial data are not logged.

## Future Work

- WebSocket or Laravel Reverb upgrade for true real-time updates
- dedicated `kitchen` staff role
- kitchen tablet deployment mode with device registration
- station-specific sound profiles
- prep time SLA reporting
- Telegram notification when orders become ready
