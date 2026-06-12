<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $shopIds = $this->accessibleShopIds($request);

        $orders = Order::with(['items', 'shop', 'branch', 'diningTable', 'payment'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('shop_id'), fn ($query, $shopId) => $query->where('shop_id', $shopId))
            ->when($request->query('branch_id'), fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->when($request->query('status'), fn ($query, $status) => $query->where('order_status', $status))
            ->when($request->query('date'), fn ($query, $date) => $query->whereDate('created_at', $date))
            ->latest()
            ->get();

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

        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $order->update($validated);

        return $this->success('Order status updated', ['order' => $order->fresh()->load(['items', 'payment'])]);
    }

    private function accessibleShopIds(Request $request): array
    {
        if ($request->user()->role === 'super_admin') {
            return Shop::pluck('id')->all();
        }

        return $request->user()->shops()->pluck('id')->all();
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        abort_unless(in_array($order->shop_id, $this->accessibleShopIds($request), true), 403);
    }
}
