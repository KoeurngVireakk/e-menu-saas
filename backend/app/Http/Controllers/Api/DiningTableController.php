<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\DiningTable;
use App\Models\Shop;
use App\Services\PublicMenuCacheService;
use App\Services\PlanEntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DiningTableController extends Controller
{
    public function __construct(
        private readonly PublicMenuCacheService $publicMenuCache,
        private readonly PlanEntitlementService $entitlements,
    ) {
    }

    public function index(Request $request, Branch $branch)
    {
        $this->authorizeBranchAccess($request, $branch);

        return $this->success('Tables loaded', [
            'tables' => $branch->diningTables()->latest()->get(),
        ]);
    }

    public function store(Request $request, Branch $branch)
    {
        $this->authorizeBranchAccess($request, $branch);
        abort_unless($request->user()->canManageTables(), 403);

        $validated = $this->validateTable($request, $branch);
        $this->entitlements->assertCanCreate($branch->shop, 'tables');
        $validated['shop_id'] = $branch->shop_id;
        $validated['branch_id'] = $branch->id;
        $validated['qr_token'] = Str::random(48);
        $validated['qr_url'] = $this->menuUrl($branch, $validated['qr_token']);

        $table = DiningTable::create($validated);
        $this->publicMenuCache->flushShop($branch->shop_id);

        return $this->success('Table created successfully', ['table' => $table], 201);
    }

    public function show(Request $request, DiningTable $table)
    {
        $this->authorizeShopAccess($request, $table->shop, $table->branch_id);

        return $this->success('Table loaded', ['table' => $table->load('branch')]);
    }

    public function update(Request $request, DiningTable $table)
    {
        $this->authorizeShopAccess($request, $table->shop, $table->branch_id);
        abort_unless($request->user()->canManageTables(), 403);

        $validated = $this->validateTable($request, $table->branch, $table->id);
        $validated['qr_token'] = $table->qr_token ?: Str::random(48);
        $validated['qr_url'] = $this->menuUrl($table->branch, $validated['qr_token']);
        $table->update($validated);
        $this->publicMenuCache->flushShop($table->shop_id);

        return $this->success('Table updated successfully', ['table' => $table->fresh()]);
    }

    public function destroy(Request $request, DiningTable $table)
    {
        $this->authorizeShopAccess($request, $table->shop, $table->branch_id);
        abort_unless($request->user()->canManageTables(), 403);
        $shopId = $table->shop_id;
        $table->delete();
        $this->publicMenuCache->flushShop($shopId);

        return $this->success('Table deleted successfully');
    }

    public function qr(Request $request, DiningTable $table)
    {
        $this->authorizeShopAccess($request, $table->shop, $table->branch_id);

        $encoded = urlencode($table->qr_url);
        $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data={$encoded}";

        return $this->success('QR data loaded', [
            'table' => $table,
            'qr_url' => $table->qr_url,
            'qr_image_url' => $qrImageUrl,
        ]);
    }

    private function validateTable(Request $request, Branch $branch, ?int $ignoreId = null): array
    {
        return $request->validate([
            'table_name' => ['required', 'string', 'max:255'],
            'table_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('dining_tables', 'table_code')
                    ->where('branch_id', $branch->id)
                    ->ignore($ignoreId),
            ],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function menuUrl(Branch $branch, string $tableToken): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return "{$frontendUrl}/menu/{$branch->shop->slug}?branch={$branch->id}&table={$tableToken}";
    }

    private function authorizeShop(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
    }
}
