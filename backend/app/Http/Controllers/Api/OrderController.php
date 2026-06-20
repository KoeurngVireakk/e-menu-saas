<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\BillingCalculator;
use App\Services\OperationsEventService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly BillingCalculator $billing,
        private readonly OperationsEventService $operationsEvents,
    )
    {
    }

    public function index(Request $request)
    {
        $shopIds = $this->accessibleShopIds($request);

        if (empty($shopIds)) {
            return $this->success('Orders loaded', [
                'orders' => [],
                'summary' => [
                    'new_count' => 0,
                    'pending_count' => 0,
                    'today_revenue' => 0,
                ],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $this->paginationLimit($request),
                    'total' => 0,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                    'has_more_pages' => false,
                ],
            ]);
        }

        // List rows only need the payment summary. Audit/provider logs remain on the
        // authorized detail endpoint and are not repeated for every order row.
        $ordersQuery = Order::with(['items', 'shop', 'branch', 'diningTable', 'payment'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('shop_id'), fn ($query, $shopId) => $query->where('shop_id', $shopId))
            ->when($request->query('branch_id'), fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->when($request->query('status'), fn ($query, $status) => $query->where('order_status', $status))
            ->when($request->query('payment_status'), fn ($query, $status) => $query->where('payment_status', $status))
            ->when($request->query('date'), fn ($query, $date) => $query->whereDate('created_at', $date));

        $ordersQuery->where(function ($query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function ($shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        $summaryQuery = clone $ordersQuery;
        $paginator = $ordersQuery->latest()->paginate($this->paginationLimit($request));

        return $this->success('Orders loaded', [
            'orders' => $paginator->items(),
            'summary' => [
                'new_count' => (clone $summaryQuery)->where('order_status', 'pending')->count(),
                'pending_count' => (clone $summaryQuery)->whereIn('order_status', ['pending', 'accepted', 'preparing'])->count(),
                'today_revenue' => (float) (clone $summaryQuery)
                    ->where('payment_status', 'paid')
                    ->where('created_at', '>=', now()->startOfDay())
                    ->sum('grand_total'),
            ],
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $this->authorizeOrder($request, $order);

        return $this->success('Order loaded', [
            'order' => $order->load(['items', 'shop', 'branch', 'diningTable', 'payment.logs']),
        ]);
    }

    public function receipt(Request $request, Order $order)
    {
        $this->authorizeOrder($request, $order);
        abort_unless($request->user()->canManageOrders(), 403);

        $order->load(['items', 'shop.settings', 'branch', 'diningTable', 'payment', 'invoice']);
        $settings = $this->billing->settings($order->shop);

        return $this->success('Receipt loaded', [
            'receipt' => [
                'receipt_number' => $settings['receipt_prefix'].'-'.$order->order_number,
                'order' => $order,
                'settings' => $settings,
                'totals' => [
                    'subtotal' => $order->subtotal,
                    'discount_total' => $order->discount_total,
                    'service_charge' => $order->service_charge,
                    'tax_total' => $order->tax_total,
                    'grand_total' => $order->grand_total,
                    'currency_code' => $order->currency_code,
                    'secondary_currency_code' => $order->secondary_currency_code,
                    'secondary_currency_total' => $order->secondary_currency_total,
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorizeOrder($request, $order);
        abort_unless($request->user()->canManageOrders(), 403);

        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $previousStatus = $order->order_status;
        $order->update($validated);
        $this->operationsEvents->broadcastOrderStatusChanged($order, $previousStatus);

        $this->audit($request, 'order.status_changed', $order->shop_id, 'order', $order->id, [
            'order_number' => $order->order_number,
            'from' => $previousStatus,
            'to' => $order->order_status,
        ]);

        return $this->success('Order status updated', ['order' => $order->fresh()->load(['items', 'payment'])]);
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        abort_unless($request->user()->canAccessShop($order->shop_id, $order->branch_id), 403);
    }
}
