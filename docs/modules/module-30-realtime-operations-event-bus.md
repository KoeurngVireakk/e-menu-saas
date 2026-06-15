# Module 30 - Real-Time Operations Event Bus

## Purpose

Module 30 adds a tenant-aware real-time operations event bus for MenuDIGI using Laravel Reverb, private broadcast channels, Laravel Echo, and Pusher protocol compatibility. It lets admin, staff, kitchen, and authenticated order-tracking screens receive operational updates without refreshing the page.

## Backend Setup

Laravel Reverb is installed through `laravel/reverb`. Broadcasting is configured with:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=menudigi-local
REVERB_APP_KEY=menudigi-key
REVERB_APP_SECRET=menudigi-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Broadcast auth is registered in `bootstrap/app.php` with the `/api/broadcasting/auth` route protected by `api` and `auth:sanctum` middleware.

## Frontend Setup

The frontend uses Laravel Echo with `pusher-js` and reads these Vite variables:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_REVERB_APP_KEY=menudigi-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

The Echo client sends the existing Sanctum bearer token from `localStorage.emenu_token` to `/api/broadcasting/auth`.

## Event List

| Event | Broadcast name | Purpose |
| --- | --- | --- |
| `OrderCreated` | `.order.created` | New customer order submitted |
| `OrderStatusChanged` | `.order.status_changed` | Order status changed by admin, staff, or kitchen |
| `PaymentConfirmed` | `.payment.confirmed` | Payment was confirmed |
| `TableActivityUpdated` | `.table.activity_updated` | Table-scoped operational activity |
| `KitchenOrderUpdated` | `.kitchen.order_updated` | Kitchen display should refresh/update an order |

Events are dispatched through `App\Services\OperationsEventService` so controllers do not duplicate broadcasting logic.

## Channel List

| Private channel | Authorized audience |
| --- | --- |
| `private-restaurant.{restaurantId}` | Authenticated users who can access the shop |
| `private-branch.{branchId}` | Users assigned to or allowed to access the branch |
| `private-table.{tableId}` | Staff/admin users who can access the table branch |
| `private-order.{orderId}` | Staff/admin users who can access the order branch |
| `private-kitchen.{branchId}` | Kitchen-capable users with branch access |
| `private-admin.restaurant.{restaurantId}` | `super_admin`, `shop_owner`, and `manager` users with shop access |

Customer guest order tracking is intentionally not opened on public channels. Until secure guest tracking tokens exist, live order tracking is limited to authenticated private-channel access.

## Payload Examples

`OrderCreated`:

```json
{
  "order_id": 1,
  "order_number": "ORD-0001",
  "restaurant_id": 1,
  "branch_id": 1,
  "table_id": 5,
  "status": "pending",
  "payment_status": "unpaid",
  "total_amount": 12500,
  "currency_code": "KHR",
  "created_at": "2026-06-15T10:00:00.000000Z"
}
```

`OrderStatusChanged`:

```json
{
  "order_id": 1,
  "order_number": "ORD-0001",
  "restaurant_id": 1,
  "branch_id": 1,
  "table_id": 5,
  "old_status": "pending",
  "new_status": "accepted",
  "changed_at": "2026-06-15T10:05:00.000000Z"
}
```

`PaymentConfirmed`:

```json
{
  "payment_id": 1,
  "order_id": 1,
  "order_number": "ORD-0001",
  "restaurant_id": 1,
  "branch_id": 1,
  "status": "confirmed",
  "amount": 12500,
  "currency_code": "KHR",
  "confirmed_at": "2026-06-15T10:10:00.000000Z"
}
```

Payloads must stay operational and safe. Do not broadcast full models, full customer private data, access tokens, payment provider secrets, raw webhook payloads, authorization headers, or proof file internals.

## Frontend Subscription API

`frontend/src/services/realtime/operationsRealtimeService.js` exposes:

- `subscribeToRestaurantOperations(restaurantId, callbacks)`
- `subscribeToBranchOperations(branchId, callbacks)`
- `subscribeToKitchenOperations(branchId, callbacks)`
- `subscribeToOrderTracking(orderId, callbacks)`
- `subscribeToTableOperations(tableId, callbacks)`
- `leaveChannel(channelName)`

`frontend/src/hooks/useOperationsRealtime.js` wraps subscription lifecycle and connection status for React components.

## Integrated Screens

- Admin dashboard listens for new orders, order status changes, and payment confirmations.
- Kitchen page listens for order and kitchen updates for the selected branch.
- Order success page uses `LiveOrderStatus`, but only enables private tracking when an auth token is present.
- `RealtimeStatusBadge` displays `Connecting`, `Live`, `Offline`, `Realtime off`, or `Realtime error`.

## Local Run Commands

Backend:

```bash
cd backend
php artisan serve
php artisan reverb:start
```

If `QUEUE_CONNECTION=database`, run the queue worker for queued broadcasts and queued jobs:

```bash
php artisan queue:work
```

For local immediate behavior, set `QUEUE_CONNECTION=sync`.

Frontend:

```bash
cd frontend
npm run dev
```

## Testing Checklist

Run:

```bash
cd backend
php artisan test
php artisan route:list

cd ../frontend
npm run lint
npm run test
npm run build
```

Backend tests verify safe broadcast payloads, tenant-aware channel authorization, order-created dispatching, order-status dispatching, and payment-confirmed dispatching.

## Security Notes

- All operational channels are private channels.
- Authorization is tenant-aware through existing shop/branch access checks.
- Public customer browsing does not subscribe to private operations channels.
- Guest order tracking needs a future signed tracking token or equivalent secure public-order session before private order channels can be opened to unauthenticated customers.
- Broadcast payloads must be reviewed when new payment providers, customer fields, or webhook integrations are added.
