<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
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
            ]);
        }

        $orders = Order::with(['items', 'shop', 'branch', 'diningTable', 'payment.logs'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('shop_id'), fn ($query, $shopId) => $query->where('shop_id', $shopId))
            ->when($request->query('branch_id'), fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->when($request->query('status'), fn ($query, $status) => $query->where('order_status', $status))
            ->when($request->query('date'), fn ($query, $date) => $query->whereDate('created_at', $date));

        $orders->where(function ($query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function ($shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        $orders = $orders->latest()->get();

        return $this->success('Orders loaded', [
            'orders' => $orders,
            'summary' => [
                'new_count' => $orders->where('order_status', 'pending')->count(),
                'pending_count' => $orders->whereIn('order_status', ['pending', 'accepted', 'preparing'])->count(),
                'today_revenue' => (float) $orders
                    ->where('payment_status', 'paid')
                    ->where('created_at', '>=', now()->startOfDay())
                    ->sum('grand_total'),
            ],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $this->authorizeOrder($request, $order);

        return $this->success('Order loaded', [
            'order' => $order->load(['items', 'shop', 'branch', 'diningTable', 'payment.logs']),
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
