<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KitchenStation;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KitchenStationController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canViewKitchen(), 403);

        $stations = $this->scopeBranchAccess(
            $request,
            $shop->kitchenStations()->with('branch'),
            $shop->id,
            includeGlobal: true,
        );

        return $this->success('Kitchen stations loaded', [
            'kitchen_stations' => $stations->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canManageKitchenStations(), 403);

        $validated = $this->validated($request, $shop);
        $station = $shop->kitchenStations()->create($validated);

        $this->audit($request, 'kitchen.station_created', $shop->id, 'kitchen_station', $station->id, [
            'name' => $station->name,
            'type' => $station->type,
            'branch_id' => $station->branch_id,
        ]);

        return $this->success('Kitchen station created', ['kitchen_station' => $station->load('branch')], 201);
    }

    public function update(Request $request, KitchenStation $station)
    {
        $this->authorizeStation($request, $station);
        abort_unless($request->user()->canManageKitchenStations(), 403);

        $validated = $this->validated($request, $station->shop);
        $station->update($validated);

        $this->audit($request, 'kitchen.station_updated', $station->shop_id, 'kitchen_station', $station->id, [
            'name' => $station->name,
            'type' => $station->type,
            'branch_id' => $station->branch_id,
            'status' => $station->status,
        ]);

        return $this->success('Kitchen station updated', ['kitchen_station' => $station->fresh('branch')]);
    }

    public function destroy(Request $request, KitchenStation $station)
    {
        $this->authorizeStation($request, $station);
        abort_unless($request->user()->canManageKitchenStations(), 403);

        $station->update(['status' => 'inactive']);

        $this->audit($request, 'kitchen.station_deleted', $station->shop_id, 'kitchen_station', $station->id, [
            'name' => $station->name,
        ]);

        return $this->success('Kitchen station archived', ['kitchen_station' => $station->fresh('branch')]);
    }

    private function validated(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(['kitchen', 'bar', 'dessert', 'general'])],
            'category_ids_json' => ['nullable', 'array'],
            'category_ids_json.*' => ['integer', Rule::exists('categories', 'id')->where('shop_id', $shop->id)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function authorizeStation(Request $request, KitchenStation $station): void
    {
        abort_unless($request->user()->canViewKitchen(), 403);
        abort_unless($request->user()->canAccessShop($station->shop_id, $station->branch_id), 403);
    }
}
