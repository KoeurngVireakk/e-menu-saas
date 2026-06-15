<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintStation;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrintStationController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canViewPrintStations(), 403);

        $stations = $this->scopeBranchAccess(
            $request,
            $shop->printStations()->with('branch'),
            $shop->id,
            includeGlobal: true,
        );

        $this->scopeStationTypeForRole($request, $stations);

        return $this->success('Print stations loaded', [
            'print_stations' => $stations->orderByDesc('is_default')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canManagePrintStations(), 403);

        $validated = $this->validated($request, $shop);
        $this->authorizeStationBranch($request, $shop, $validated['branch_id'] ?? null);

        $station = DB::transaction(function () use ($request, $shop, $validated) {
            if ($validated['is_default'] ?? false) {
                $this->clearDefaultStations($shop->id, $validated['type'], $validated['branch_id'] ?? null);
            }

            $station = $shop->printStations()->create($validated);
            $this->audit($request, 'print_station.created', $shop->id, 'print_station', $station->id, [
                'name' => $station->name,
                'type' => $station->type,
                'paper_size' => $station->paper_size,
                'branch_id' => $station->branch_id,
            ]);

            return $station;
        });

        return $this->success('Print station created', [
            'print_station' => $station->load('branch'),
        ], 201);
    }

    public function show(Request $request, PrintStation $printStation)
    {
        $this->authorizeStationView($request, $printStation);

        return $this->success('Print station loaded', [
            'print_station' => $printStation->load('shop', 'branch'),
        ]);
    }

    public function update(Request $request, PrintStation $printStation)
    {
        $this->authorizeStationView($request, $printStation);
        abort_unless($request->user()->canManagePrintStations(), 403);

        $validated = $this->validated($request, $printStation->shop);
        $this->authorizeStationBranch($request, $printStation->shop, $validated['branch_id'] ?? null);

        DB::transaction(function () use ($request, $printStation, $validated) {
            if ($validated['is_default'] ?? false) {
                $this->clearDefaultStations($printStation->shop_id, $validated['type'], $validated['branch_id'] ?? null, $printStation->id);
            }

            $printStation->update($validated);
            $this->audit($request, 'print_station.updated', $printStation->shop_id, 'print_station', $printStation->id, [
                'name' => $printStation->name,
                'type' => $printStation->type,
                'paper_size' => $printStation->paper_size,
                'branch_id' => $printStation->branch_id,
                'status' => $printStation->status,
            ]);
        });

        return $this->success('Print station updated', [
            'print_station' => $printStation->fresh()->load('branch'),
        ]);
    }

    public function destroy(Request $request, PrintStation $printStation)
    {
        $this->authorizeStationView($request, $printStation);
        abort_unless($request->user()->canManagePrintStations(), 403);

        $stationId = $printStation->id;
        $shopId = $printStation->shop_id;
        $printStation->delete();

        $this->audit($request, 'print_station.deleted', $shopId, 'print_station', $stationId);

        return $this->success('Print station deleted');
    }

    private function validated(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where('shop_id', $shop->id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(['kitchen', 'cashier', 'bar', 'receipt'])],
            'paper_size' => ['required', Rule::in(['58mm', '80mm', 'a4'])],
            'is_default' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function authorizeStationView(Request $request, PrintStation $station): void
    {
        abort_unless($request->user()->canViewPrintStations(), 403);
        abort_unless($request->user()->canAccessShop($station->shop_id, $station->branch_id), 403);

        if ($request->user()->role === 'cashier') {
            abort_unless(in_array($station->type, ['cashier', 'receipt'], true), 403);
        }

        if ($request->user()->role === 'waiter') {
            abort_unless(in_array($station->type, ['kitchen', 'bar'], true), 403);
        }
    }

    private function authorizeStationBranch(Request $request, Shop $shop, ?int $branchId): void
    {
        $branchIds = $request->user()->accessibleBranchIdsForShop($shop->id);

        if ($branchIds !== null && $branchId === null) {
            abort(403);
        }

        $this->authorizeShopAccess($request, $shop, $branchId);
    }

    private function scopeStationTypeForRole(Request $request, mixed $query): void
    {
        if ($request->user()->role === 'cashier') {
            $query->whereIn('type', ['cashier', 'receipt']);
        }

        if ($request->user()->role === 'waiter') {
            $query->whereIn('type', ['kitchen', 'bar']);
        }
    }

    private function clearDefaultStations(int $shopId, string $type, ?int $branchId, ?int $exceptId = null): void
    {
        PrintStation::where('shop_id', $shopId)
            ->where('type', $type)
            ->where('branch_id', $branchId)
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->update(['is_default' => false]);
    }
}
