<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashLedgerEntry;
use App\Models\CashDrawerShift;
use App\Models\DailyClosing;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Shop;
use App\Services\CashLedgerService;
use App\Services\Reports\AnalyticsReportService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function __construct(
        private readonly CashLedgerService $ledger,
        private readonly AnalyticsReportService $analytics,
    )
    {
    }

    public function summary(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Report summary loaded', [
            'summary' => $this->analytics->summary($request->user(), $filters),
        ]);
    }

    public function salesTrend(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Sales trend loaded', [
            'sales_trend' => $this->analytics->salesTrend($request->user(), $filters),
        ]);
    }

    public function orderStatus(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Order status report loaded', [
            'order_status' => $this->analytics->orderStatus($request->user(), $filters),
        ]);
    }

    public function topProducts(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Top products loaded', [
            'top_products' => $this->analytics->topProducts($request->user(), $filters),
        ]);
    }

    public function branchPerformance(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Branch performance loaded', [
            'branch_performance' => $this->analytics->branchPerformance($request->user(), $filters),
        ]);
    }

    public function hourlyActivity(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Hourly activity loaded', [
            'hourly_activity' => $this->analytics->hourlyActivity($request->user(), $filters),
        ]);
    }

    public function analyticsOverview(Request $request)
    {
        $filters = $this->analyticsFilters($request);

        return $this->success('Analytics overview loaded', [
            'reports' => $this->analytics->all($request->user(), $filters),
            'filters' => [
                'shop_id' => $filters['shop_id'],
                'branch_id' => $filters['branch_id'],
                'date_from' => $filters['date_from']->toDateString(),
                'date_to' => $filters['date_to']->toDateString(),
                'period' => $filters['period'],
                'payment_status' => $filters['payment_status'],
                'order_status' => $filters['order_status'],
            ],
        ]);
    }

    public function exportSummary(Request $request)
    {
        $filters = $this->analyticsFilters($request);
        abort_unless($request->user()->canExportReports(), 403);
        $summary = $this->analytics->summary($request->user(), $filters);
        $products = $this->analytics->topProducts($request->user(), $filters);
        $rows = [
            ['Metric', 'Value'],
            ['Total sales', $summary['total_sales']],
            ['Order count', $summary['order_count']],
            ['Average order value', $summary['average_order_value']],
            ['Paid amount', $summary['paid_amount']],
            ['Unpaid amount', $summary['unpaid_amount']],
            ['Pending payments', $summary['pending_payments']],
            [],
            ['Top product', 'Quantity sold', 'Revenue', 'Share'],
            ...collect($products)->map(fn (array $product) => [
                $product['product_name'],
                $product['quantity_sold'],
                $product['revenue'],
                $product['share'].'%',
            ])->all(),
        ];
        $csv = collect($rows)
            ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', (string) $value).'"')->implode(','))
            ->implode("\n");

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="menudigi-report-summary.csv"',
        ]);
    }

    public function salesSummary(Request $request)
    {
        $filters = $this->filters($request);

        return $this->success('Sales summary loaded', [
            'summary' => $this->salesSummaryData($request, $filters),
        ]);
    }

    public function productSales(Request $request)
    {
        $filters = $this->filters($request);

        return $this->success('Product sales loaded', [
            'products' => $this->productSalesData($request, $filters),
        ]);
    }

    public function paymentMethods(Request $request)
    {
        $filters = $this->filters($request);

        return $this->success('Payment methods loaded', [
            'payment_methods' => $this->paymentMethodData($request, $filters),
        ]);
    }

    public function dailyClosing(Request $request)
    {
        $filters = $this->filters($request, requireShop: false);
        $this->authorizeReports($request, $filters);

        $closings = DailyClosing::with(['shop', 'branch', 'closer'])
            ->whereIn('shop_id', $filters['shop_ids'])
            ->when($filters['shop_id'], fn ($query, $shopId) => $query->where('shop_id', $shopId))
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['date'], fn ($query, $date) => $query->whereDate('closing_date', $date));

        $closings->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId, includeGlobal: true);
                });
            }
        });

        return $this->success('Daily closings loaded', [
            'closings' => $closings->latest('closing_date')->limit(30)->get(),
            'summary' => $filters['shop_id'] ? $this->salesSummaryData($request, $filters) : null,
            'payment_methods' => $filters['shop_id'] ? $this->paymentMethodData($request, $filters) : null,
            'shift_summary' => $filters['shop_id'] ? $this->shiftSummaryData($request, $filters) : null,
            'ledger_summary' => $filters['shop_id'] ? $this->ledgerSummaryData($request, $filters) : null,
        ]);
    }

    public function storeDailyClosing(Request $request)
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('shop_id', $request->integer('shop_id'))],
            'closing_date' => ['nullable', 'date'],
            'counted_cash_total' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
            'reopen' => ['nullable', 'boolean'],
        ]);

        $filters = $this->filters($request, requireShop: true, dateKey: 'closing_date');
        abort_unless($request->user()->canManageDailyClosing(), 403);
        $this->authorizeReports($request, $filters);

        $openShifts = $this->shiftQuery($request, $filters)->where('status', 'open')->count();
        if ($openShifts > 0) {
            return $this->error('Close open cashier shifts before daily closing.', [
                'open_shifts' => [$openShifts.' open shift(s) must be closed first.'],
            ], 409);
        }

        $existing = DailyClosing::where('shop_id', $filters['shop_id'])
            ->where('branch_id', $filters['branch_id'])
            ->whereDate('closing_date', $filters['date'])
            ->first();

        if ($existing && $existing->status === 'closed' && ! ($validated['reopen'] ?? false)) {
            return $this->error('This day is already closed. Reopen it before saving changes.', [
                'daily_closing' => ['Duplicate closed records are not allowed.'],
            ], 409);
        }

        $summary = $this->salesSummaryData($request, $filters);
        $payments = $this->paymentMethodData($request, $filters);
        $expectedCash = (float) ($payments['methods']['cash']['paid_total'] ?? 0);
        $countedCash = array_key_exists('counted_cash_total', $validated) ? (float) $validated['counted_cash_total'] : null;

        $closing = DailyClosing::updateOrCreate(
            [
                'shop_id' => $filters['shop_id'],
                'branch_id' => $filters['branch_id'],
                'closing_date' => $filters['date'],
            ],
            [
                'opened_by' => $existing?->opened_by,
                'closed_by' => $request->user()->id,
                'currency_code' => $summary['currency_code'],
                'expected_cash_total' => $expectedCash,
                'counted_cash_total' => $countedCash,
                'cash_difference' => $countedCash === null ? null : $countedCash - $expectedCash,
                'payment_totals_json' => $payments,
                'sales_summary_json' => $summary,
                'note' => $validated['note'] ?? null,
                'status' => 'closed',
                'closed_at' => now(),
            ],
        );
        $this->ledger->recordClosingDifference($closing->fresh('shop'), (float) ($closing->cash_difference ?? 0), $request->user()->id);

        $this->audit($request, 'daily_closing.closed', $closing->shop_id, 'daily_closing', $closing->id, [
            'branch_id' => $closing->branch_id,
            'closing_date' => $closing->closing_date?->toDateString(),
            'expected_cash_total' => $closing->expected_cash_total,
            'counted_cash_total' => $closing->counted_cash_total,
            'cash_difference' => $closing->cash_difference,
            'currency_code' => $closing->currency_code,
        ]);

        return $this->success('Daily closing saved', [
            'daily_closing' => $closing->load(['shop', 'branch', 'closer']),
        ], $closing->wasRecentlyCreated ? 201 : 200);
    }

    private function filters(Request $request, bool $requireShop = false, string $dateKey = 'date'): array
    {
        abort_unless($request->user()->canViewReports(), 403);

        $validated = $request->validate([
            'shop_id' => [$requireShop ? 'required' : 'nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
            'closing_date' => ['nullable', 'date'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'pending', 'paid', 'failed'])],
            'order_status' => ['nullable', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $date = $validated[$dateKey] ?? $validated['date'] ?? now()->toDateString();
        $dateFrom = $validated['date_from'] ?? $date;
        $dateTo = $validated['date_to'] ?? $date;
        $branchId = isset($validated['branch_id']) ? (int) $validated['branch_id'] : null;
        $hasBranchFilter = $branchId !== null;

        $filters = [
            'shop_id' => $validated['shop_id'] ?? null,
            'shop_ids' => $shopIds,
            'date' => $date,
            'date_from' => CarbonImmutable::parse($dateFrom)->startOfDay(),
            'date_to' => CarbonImmutable::parse($dateTo)->endOfDay(),
            'payment_status' => $validated['payment_status'] ?? null,
            'order_status' => $validated['order_status'] ?? null,
            'branch_id' => $branchId,
            'has_branch_filter' => $hasBranchFilter,
        ];

        $this->authorizeReports($request, $filters);

        return $filters;
    }

    private function analyticsFilters(Request $request): array
    {
        abort_unless($request->user()->canViewReports(), 403);

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'period' => ['nullable', Rule::in(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'custom'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'pending', 'paid', 'failed'])],
            'order_status' => ['nullable', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $period = $validated['period'] ?? 'last_7_days';
        [$dateFrom, $dateTo] = $this->analyticsDateRange($period, $validated);
        abort_unless($dateFrom->diffInDays($dateTo) <= 366, 422, 'Report date range cannot exceed 366 days.');

        $branchId = isset($validated['branch_id']) ? (int) $validated['branch_id'] : null;
        foreach ($shopIds as $shopId) {
            abort_unless($request->user()->canAccessShop($shopId, $branchId), 403);
        }

        if ($request->user()->role === 'cashier') {
            abort_unless(isset($validated['shop_id']) && $branchId !== null, 403);
        }

        return [
            'shop_id' => $validated['shop_id'] ?? null,
            'shop_ids' => $shopIds,
            'branch_id' => $branchId,
            'period' => $period,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'payment_status' => $validated['payment_status'] ?? null,
            'order_status' => $validated['order_status'] ?? null,
        ];
    }

    private function analyticsDateRange(string $period, array $validated): array
    {
        $today = CarbonImmutable::today();

        return match ($period) {
            'today' => [$today->startOfDay(), $today->endOfDay()],
            'yesterday' => [$today->subDay()->startOfDay(), $today->subDay()->endOfDay()],
            'last_30_days' => [$today->subDays(29)->startOfDay(), $today->endOfDay()],
            'this_month' => [$today->startOfMonth(), $today->endOfDay()],
            'custom' => [
                CarbonImmutable::parse($validated['date_from'] ?? $today->toDateString())->startOfDay(),
                CarbonImmutable::parse($validated['date_to'] ?? $today->toDateString())->endOfDay(),
            ],
            default => [$today->subDays(6)->startOfDay(), $today->endOfDay()],
        };
    }

    private function authorizeReports(Request $request, array $filters): void
    {
        abort_unless($request->user()->canViewReports(), 403);

        if (empty($filters['shop_ids'])) {
            return;
        }

        if ($request->user()->role === 'cashier') {
            abort_unless(isset($filters['shop_id']) && $filters['branch_id'] !== null, 403);
        }

        foreach ($filters['shop_ids'] as $shopId) {
            abort_unless($request->user()->canAccessShop($shopId, $filters['branch_id'] ?? null), 403);
        }
    }

    private function salesSummaryData(Request $request, array $filters): array
    {
        $allOrders = $this->orderQuery($request, $filters)->get();
        $financialOrders = $allOrders
            ->where('order_status', 'completed')
            ->where('payment_status', 'paid');
        $openFinancialOrders = $allOrders
            ->where('order_status', '!=', 'cancelled');

        $currency = $this->currencyCode($filters, $allOrders->first()?->shop);
        $expenseSummary = $this->expenseSummaryData($request, $filters);
        $ledgerSummary = $this->ledgerSummaryData($request, $filters);
        $netSales = $this->money($financialOrders->sum('grand_total'));

        return [
            'total_orders' => $allOrders->count(),
            'completed_orders' => $allOrders->where('order_status', 'completed')->count(),
            'cancelled_orders' => $allOrders->where('order_status', 'cancelled')->count(),
            'gross_sales' => $this->money($financialOrders->sum(fn (Order $order) => (float) $order->subtotal + (float) $order->discount_total)),
            'discount_total' => $this->money($financialOrders->sum('discount_total')),
            'service_charge_total' => $this->money($financialOrders->sum('service_charge')),
            'tax_total' => $this->money($financialOrders->sum('tax_total')),
            'net_sales' => $netSales,
            'paid_total' => $this->money($openFinancialOrders->where('payment_status', 'paid')->sum('grand_total')),
            'unpaid_total' => $this->money($openFinancialOrders->where('payment_status', '!=', 'paid')->sum('grand_total')),
            'total_expenses' => $expenseSummary['paid_total'],
            'net_after_expenses' => $this->money($netSales - $expenseSummary['paid_total']),
            'cash_ledger_in_total' => $ledgerSummary['in_total'],
            'cash_ledger_out_total' => $ledgerSummary['out_total'],
            'cash_ledger_net_total' => $ledgerSummary['net_total'],
            'cash_out_expenses' => $ledgerSummary['cash_out_expenses'],
            'secondary_currency_total' => $this->money($financialOrders->sum('secondary_currency_total')),
            'currency_code' => $currency,
            'date_from' => $filters['date_from']->toDateString(),
            'date_to' => $filters['date_to']->toDateString(),
            'order_statuses' => $allOrders
                ->groupBy('order_status')
                ->map(fn ($orders, $status) => ['status' => $status, 'count' => $orders->count()])
                ->values(),
        ];
    }

    private function productSalesData(Request $request, array $filters)
    {
        return OrderItem::query()
            ->select([
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as quantity_sold'),
                DB::raw('SUM(order_items.total_price + CASE WHEN order_items.discount_price IS NOT NULL AND order_items.unit_price > order_items.discount_price THEN (order_items.unit_price - order_items.discount_price) * order_items.quantity ELSE 0 END) as gross_total'),
                DB::raw('SUM(CASE WHEN order_items.discount_price IS NOT NULL AND order_items.unit_price > order_items.discount_price THEN (order_items.unit_price - order_items.discount_price) * order_items.quantity ELSE 0 END) as discount_total'),
                DB::raw('SUM(order_items.total_price) as net_total'),
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.shop_id', $filters['shop_ids'])
            ->whereBetween('orders.created_at', [$filters['date_from'], $filters['date_to']])
            ->where('orders.order_status', 'completed')
            ->where('orders.payment_status', 'paid')
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('orders.branch_id', $filters['branch_id']))
            ->when($filters['payment_status'], fn ($query, $status) => $query->where('orders.payment_status', $status))
            ->when($filters['order_status'], fn ($query, $status) => $query->where('orders.order_status', $status))
            ->where(function (Builder $query) use ($request, $filters) {
                foreach ($filters['shop_ids'] as $shopId) {
                    $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                        $shopQuery->where('orders.shop_id', $shopId);
                        $this->scopeBranchAccess($request, $shopQuery, $shopId, 'orders.branch_id');
                    });
                }
            })
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('quantity_sold')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'product_id' => $row->product_id,
                'product_name' => $row->product_name,
                'quantity_sold' => (int) $row->quantity_sold,
                'gross_total' => $this->money($row->gross_total),
                'discount_total' => $this->money($row->discount_total),
                'net_total' => $this->money($row->net_total),
            ]);
    }

    private function paymentMethodData(Request $request, array $filters): array
    {
        $payments = Payment::with('order')
            ->whereIn('shop_id', $filters['shop_ids'])
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->where(function (Builder $query) use ($request, $filters) {
                foreach ($filters['shop_ids'] as $shopId) {
                    $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                        $shopQuery->where('shop_id', $shopId);
                        $this->scopeBranchAccess($request, $shopQuery, $shopId);
                    });
                }
            })
            ->get();

        $methods = collect(['cash', 'khqr_manual', 'bakong_khqr'])
            ->mapWithKeys(fn ($method) => [
                $method => [
                    'paid_total' => $this->money($payments->where('payment_method', $method)->where('status', 'paid')->sum('amount')),
                    'pending_total' => $this->money($payments->where('payment_method', $method)->where('status', 'pending')->sum('amount')),
                    'failed_total' => $this->money($payments->where('payment_method', $method)->where('status', 'failed')->sum('amount')),
                    'count' => $payments->where('payment_method', $method)->count(),
                ],
            ])
            ->all();

        $orders = $this->orderQuery($request, $filters)->get();

        return [
            'methods' => $methods,
            'unpaid_total' => $this->money($orders->where('payment_status', 'unpaid')->where('order_status', '!=', 'cancelled')->sum('grand_total')),
            'pending_total' => $this->money($payments->where('status', 'pending')->sum('amount')),
            'failed_total' => $this->money($payments->where('status', 'failed')->sum('amount')),
            'paid_total' => $this->money($payments->where('status', 'paid')->sum('amount')),
            'currency_code' => $this->currencyCode($filters, $orders->first()?->shop),
        ];
    }

    private function shiftSummaryData(Request $request, array $filters): array
    {
        $shifts = $this->shiftQuery($request, $filters)->get();

        return [
            'open_shifts' => $shifts->where('status', 'open')->count(),
            'closed_shifts' => $shifts->where('status', 'closed')->count(),
            'cancelled_shifts' => $shifts->where('status', 'cancelled')->count(),
            'expected_cash_total' => $this->money($shifts->where('status', 'closed')->sum('expected_cash_total')),
            'counted_cash_total' => $this->money($shifts->where('status', 'closed')->sum('counted_cash_total')),
            'cash_difference' => $this->money($shifts->where('status', 'closed')->sum('cash_difference')),
        ];
    }

    private function expenseSummaryData(Request $request, array $filters): array
    {
        $expenses = $this->expenseQuery($request, $filters)->get();

        return [
            'paid_total' => $this->money($expenses->where('status', 'paid')->sum('amount')),
            'pending_total' => $this->money($expenses->whereIn('status', ['draft', 'pending', 'approved'])->sum('amount')),
            'count' => $expenses->count(),
        ];
    }

    private function ledgerSummaryData(Request $request, array $filters): array
    {
        $entries = $this->ledgerQuery($request, $filters)->get();
        $inTotal = $this->money($entries->where('direction', 'in')->sum('amount'));
        $outTotal = $this->money($entries->where('direction', 'out')->sum('amount'));

        return [
            'in_total' => $inTotal,
            'out_total' => $outTotal,
            'net_total' => $this->money($inTotal - $outTotal),
            'cash_out_expenses' => $this->money($entries
                ->where('entry_type', 'expense')
                ->where('direction', 'out')
                ->where('metadata_json.payment_method', 'cash')
                ->sum('amount')),
            'cash_in_movements' => $this->money($entries->where('entry_type', 'cash_in')->sum('amount')),
            'cash_out_movements' => $this->money($entries->where('entry_type', 'cash_out')->sum('amount')),
        ];
    }

    private function orderQuery(Request $request, array $filters): Builder
    {
        $orders = Order::with('shop')
            ->whereIn('shop_id', $filters['shop_ids'])
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['payment_status'], fn ($query, $status) => $query->where('payment_status', $status))
            ->when($filters['order_status'], fn ($query, $status) => $query->where('order_status', $status));

        $orders->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $orders;
    }

    private function shiftQuery(Request $request, array $filters): Builder
    {
        $shifts = CashDrawerShift::whereIn('shop_id', $filters['shop_ids'])
            ->whereBetween('opened_at', [$filters['date_from'], $filters['date_to']])
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']));

        $shifts->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $shifts;
    }

    private function expenseQuery(Request $request, array $filters): Builder
    {
        $expenses = Expense::whereIn('shop_id', $filters['shop_ids'])
            ->whereDate('expense_date', '>=', $filters['date_from']->toDateString())
            ->whereDate('expense_date', '<=', $filters['date_to']->toDateString())
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']));

        $expenses->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId, includeGlobal: true);
                });
            }
        });

        return $expenses;
    }

    private function ledgerQuery(Request $request, array $filters): Builder
    {
        $entries = CashLedgerEntry::whereIn('shop_id', $filters['shop_ids'])
            ->whereDate('entry_date', '>=', $filters['date_from']->toDateString())
            ->whereDate('entry_date', '<=', $filters['date_to']->toDateString())
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']));

        $entries->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId, includeGlobal: true);
                });
            }
        });

        return $entries;
    }

    private function currencyCode(array $filters, mixed $fallbackShop = null): string
    {
        if ($fallbackShop?->currency_code) {
            return $fallbackShop->currency_code;
        }

        if ($filters['shop_id']) {
            return Shop::whereKey($filters['shop_id'])->value('currency_code') ?: 'KHR';
        }

        return 'KHR';
    }

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }
}
