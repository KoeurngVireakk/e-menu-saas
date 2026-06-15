<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashLedgerEntry;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CashLedgerController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->canViewCashLedger(), 403);

        $filters = $this->filters($request);
        $entries = $this->ledgerQuery($request, $filters)
            ->with(['shop', 'branch', 'shift', 'user'])
            ->latest('entry_date')
            ->latest()
            ->get();

        return $this->success('Cash ledger loaded', [
            'entries' => $entries,
            'summary' => [
                'in_total' => $this->money($entries->where('direction', 'in')->sum('amount')),
                'out_total' => $this->money($entries->where('direction', 'out')->sum('amount')),
                'net_total' => $this->money($entries->where('direction', 'in')->sum('amount') - $entries->where('direction', 'out')->sum('amount')),
                'count' => $entries->count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        abort_unless($request->user()->canExportCashLedger(), 403);

        $filters = $this->filters($request);
        $entries = $this->ledgerQuery($request, $filters)
            ->with(['branch'])
            ->oldest('entry_date')
            ->oldest()
            ->get();

        $rows = [
            ['date', 'branch', 'type', 'direction', 'amount', 'currency', 'source', 'description'],
            ...$entries->map(fn (CashLedgerEntry $entry) => [
                $entry->entry_date?->toDateString(),
                $entry->branch?->name ?? 'All branches',
                $entry->entry_type,
                $entry->direction,
                $entry->amount,
                $entry->currency_code,
                class_basename((string) $entry->source_type).($entry->source_id ? '#'.$entry->source_id : ''),
                $entry->description,
            ])->all(),
        ];

        $csv = collect($rows)
            ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', (string) $value).'"')->implode(','))
            ->implode("\n");

        $this->audit($request, 'cash_ledger.exported', $filters['shop_id'], 'cash_ledger', null, [
            'date_from' => $filters['date_from']->toDateString(),
            'date_to' => $filters['date_to']->toDateString(),
            'entry_count' => $entries->count(),
        ]);

        return response($csv."\n", 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="cash-ledger-'.$filters['date_from']->toDateString().'.csv"',
        ]);
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'entry_type' => ['nullable', Rule::in(['sale', 'payment', 'expense', 'refund', 'adjustment', 'cash_in', 'cash_out', 'opening_float', 'closing_difference'])],
            'direction' => ['nullable', Rule::in(['in', 'out'])],
            'payment_method' => ['nullable', Rule::in(['cash', 'khqr_manual', 'bakong_khqr', 'bank_transfer', 'other'])],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $date = $validated['date'] ?? now()->toDateString();

        return [
            'shop_id' => isset($validated['shop_id']) ? (int) $validated['shop_id'] : null,
            'shop_ids' => $shopIds,
            'branch_id' => isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            'has_branch_filter' => isset($validated['branch_id']),
            'date_from' => CarbonImmutable::parse($validated['date_from'] ?? $date)->startOfDay(),
            'date_to' => CarbonImmutable::parse($validated['date_to'] ?? $date)->endOfDay(),
            'entry_type' => $validated['entry_type'] ?? null,
            'direction' => $validated['direction'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
        ];
    }

    private function ledgerQuery(Request $request, array $filters): Builder
    {
        $entries = CashLedgerEntry::whereIn('shop_id', $filters['shop_ids'])
            ->whereDate('entry_date', '>=', $filters['date_from']->toDateString())
            ->whereDate('entry_date', '<=', $filters['date_to']->toDateString())
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['entry_type'], fn ($query, $type) => $query->where('entry_type', $type))
            ->when($filters['direction'], fn ($query, $direction) => $query->where('direction', $direction))
            ->when($filters['payment_method'], fn ($query, $method) => $query->where('metadata_json->payment_method', $method));

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

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }
}
