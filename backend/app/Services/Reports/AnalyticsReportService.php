<?php

namespace App\Services\Reports;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Collection;

class AnalyticsReportService
{
    private const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

    public function summary(User $user, array $filters): array
    {
        $orders = $this->orders($user, $filters);
        $payments = $this->payments($user, $filters);
        $activeOrders = $orders->where('order_status', '!=', 'cancelled');
        $completedPaidOrders = $orders
            ->where('order_status', 'completed')
            ->where('payment_status', 'paid');
        $paidAmount = $this->money($payments->where('status', 'paid')->sum('amount'));
        $orderCount = $activeOrders->count();

        return [
            'total_sales' => $this->money($completedPaidOrders->sum('grand_total')),
            'order_count' => $orderCount,
            'average_order_value' => $orderCount > 0 ? $this->money($activeOrders->sum('grand_total') / $orderCount) : 0.0,
            'pending_orders' => $orders->where('order_status', 'pending')->count(),
            'completed_orders' => $orders->where('order_status', 'completed')->count(),
            'cancelled_orders' => $orders->where('order_status', 'cancelled')->count(),
            'paid_amount' => $paidAmount,
            'unpaid_amount' => $this->money($activeOrders->where('payment_status', '!=', 'paid')->sum('grand_total')),
            'pending_payments' => $payments->where('status', 'pending')->count(),
            'pending_payment_amount' => $this->money($payments->where('status', 'pending')->sum('amount')),
            'currency_code' => $this->currencyCode($filters, $orders),
            'date_from' => $filters['date_from']->toDateString(),
            'date_to' => $filters['date_to']->toDateString(),
        ];
    }

    public function salesTrend(User $user, array $filters): array
    {
        $orders = $this->orders($user, $filters);
        $days = collect();
        $cursor = $filters['date_from'];

        while ($cursor->lessThanOrEqualTo($filters['date_to'])) {
            $date = $cursor->toDateString();
            $dayOrders = $orders->filter(fn (Order $order) => $order->created_at?->toDateString() === $date);
            $completedPaid = $dayOrders->where('order_status', 'completed')->where('payment_status', 'paid');

            $days->push([
                'date' => $date,
                'label' => $cursor->format('M j'),
                'sales' => $this->money($completedPaid->sum('grand_total')),
                'orders' => $dayOrders->where('order_status', '!=', 'cancelled')->count(),
            ]);

            $cursor = $cursor->addDay();
        }

        return $days->all();
    }

    public function orderStatus(User $user, array $filters): array
    {
        $orders = $this->orders($user, $filters);

        return collect(self::ORDER_STATUSES)
            ->map(fn (string $status) => [
                'status' => $status,
                'label' => str($status)->headline()->toString(),
                'count' => $orders->where('order_status', $status)->count(),
            ])
            ->all();
    }

    public function topProducts(User $user, array $filters, int $limit = 10): array
    {
        $orders = $this->orders($user, $filters)
            ->where('order_status', 'completed')
            ->where('payment_status', 'paid');
        $items = $orders->flatMap(fn (Order $order) => $order->items);
        $totalRevenue = (float) $items->sum('total_price');

        return $items
            ->groupBy('product_id')
            ->map(function (Collection $rows) use ($totalRevenue) {
                $revenue = $this->money($rows->sum('total_price'));

                return [
                    'product_id' => $rows->first()->product_id,
                    'product_name' => $rows->first()->product_name,
                    'quantity_sold' => (int) $rows->sum('quantity'),
                    'revenue' => $revenue,
                    'share' => $totalRevenue > 0 ? $this->money(($revenue / $totalRevenue) * 100) : 0.0,
                ];
            })
            ->sortByDesc('revenue')
            ->values()
            ->take($limit)
            ->all();
    }

    public function paymentMethods(User $user, array $filters): array
    {
        $payments = $this->payments($user, $filters);
        $methods = ['cash', 'khqr_manual', 'bakong_khqr', 'aba_payway', 'other'];

        return collect($methods)
            ->map(function (string $method) use ($payments) {
                $rows = $method === 'other'
                    ? $payments->whereNotIn('payment_method', ['cash', 'khqr_manual', 'bakong_khqr', 'aba_payway'])
                    : $payments->where('payment_method', $method);

                return [
                    'method' => $method,
                    'label' => $this->methodLabel($method),
                    'count' => $rows->count(),
                    'paid_total' => $this->money($rows->where('status', 'paid')->sum('amount')),
                    'pending_total' => $this->money($rows->where('status', 'pending')->sum('amount')),
                    'failed_total' => $this->money($rows->where('status', 'failed')->sum('amount')),
                ];
            })
            ->filter(fn (array $row) => $row['count'] > 0 || $row['method'] !== 'other')
            ->values()
            ->all();
    }

    public function branchPerformance(User $user, array $filters): array
    {
        $orders = $this->orders($user, $filters);

        return $orders
            ->groupBy('branch_id')
            ->map(function (Collection $rows) {
                $activeOrders = $rows->where('order_status', '!=', 'cancelled');
                $completedPaid = $rows->where('order_status', 'completed')->where('payment_status', 'paid');
                $orderCount = $activeOrders->count();

                return [
                    'branch_id' => $rows->first()->branch_id,
                    'branch_name' => $rows->first()->branch?->name ?: 'Unassigned branch',
                    'sales' => $this->money($completedPaid->sum('grand_total')),
                    'orders' => $orderCount,
                    'average_order_value' => $orderCount > 0 ? $this->money($activeOrders->sum('grand_total') / $orderCount) : 0.0,
                    'pending_payments' => $rows->where('payment_status', '!=', 'paid')->where('order_status', '!=', 'cancelled')->count(),
                ];
            })
            ->sortByDesc('sales')
            ->values()
            ->all();
    }

    public function hourlyActivity(User $user, array $filters): array
    {
        $orders = $this->orders($user, $filters);

        return collect(range(0, 23))
            ->map(function (int $hour) use ($orders) {
                $rows = $orders->filter(fn (Order $order) => (int) $order->created_at?->format('G') === $hour);

                return [
                    'hour' => $hour,
                    'label' => sprintf('%02d:00', $hour),
                    'orders' => $rows->where('order_status', '!=', 'cancelled')->count(),
                    'sales' => $this->money($rows->where('order_status', 'completed')->where('payment_status', 'paid')->sum('grand_total')),
                ];
            })
            ->all();
    }

    public function kitchen(User $user, array $filters): array
    {
        $items = $this->orders($user, $filters)->flatMap(fn (Order $order) => $order->items);

        return [
            'pending' => $items->where('kitchen_status', 'pending')->count(),
            'preparing' => $items->where('kitchen_status', 'preparing')->count(),
            'ready' => $items->where('kitchen_status', 'ready')->count(),
            'served' => $items->where('kitchen_status', 'served')->count(),
        ];
    }

    public function all(User $user, array $filters): array
    {
        return [
            'summary' => $this->summary($user, $filters),
            'sales_trend' => $this->salesTrend($user, $filters),
            'order_status' => $this->orderStatus($user, $filters),
            'top_products' => $this->topProducts($user, $filters),
            'payment_methods' => $this->paymentMethods($user, $filters),
            'branch_performance' => $this->branchPerformance($user, $filters),
            'hourly_activity' => $this->hourlyActivity($user, $filters),
            'kitchen' => $this->kitchen($user, $filters),
        ];
    }

    private function orders(User $user, array $filters): Collection
    {
        return Order::with(['items', 'branch', 'shop'])
            ->whereIn('shop_id', $filters['shop_ids'])
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->when($filters['branch_id'] !== null, fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['payment_status'], fn ($query, $status) => $query->where('payment_status', $status))
            ->when($filters['order_status'], fn ($query, $status) => $query->where('order_status', $status))
            ->get()
            ->filter(fn (Order $order) => $user->canAccessShop($order->shop_id, $order->branch_id))
            ->values();
    }

    private function payments(User $user, array $filters): Collection
    {
        return Payment::with(['order', 'branch', 'shop'])
            ->whereIn('shop_id', $filters['shop_ids'])
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->when($filters['branch_id'] !== null, fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['payment_status'], fn ($query, $status) => $query->where('status', $status === 'unpaid' ? '__never__' : $status))
            ->get()
            ->filter(fn (Payment $payment) => $user->canAccessShop($payment->shop_id, $payment->branch_id))
            ->values();
    }

    private function currencyCode(array $filters, Collection $orders): string
    {
        if ($orders->first()?->currency_code) {
            return $orders->first()->currency_code;
        }

        if ($filters['shop_id']) {
            return Shop::whereKey($filters['shop_id'])->value('currency_code') ?: 'KHR';
        }

        return 'KHR';
    }

    private function methodLabel(string $method): string
    {
        return match ($method) {
            'cash' => 'Cash',
            'khqr_manual' => 'Manual KHQR',
            'bakong_khqr' => 'Bakong KHQR',
            'aba_payway' => 'ABA',
            default => 'Other',
        };
    }

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }
}
