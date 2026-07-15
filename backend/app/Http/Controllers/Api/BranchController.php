<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Shop;
use App\Services\PublicMenuCacheService;
use App\Services\PlanEntitlementService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchController extends Controller
{
    public function __construct(
        private readonly PublicMenuCacheService $publicMenuCache,
        private readonly PlanEntitlementService $entitlements,
    ) {
    }

    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);
        $query = $this->scopeBranchAccess(
            $request,
            $shop->branches()
                ->select(['id', 'shop_id', 'name', 'phone', 'address', 'google_map_url', 'opening_time', 'closing_time', 'status'])
                ->latest('id'),
            $shop->id,
            'id'
        );

        return $this->success('Branches loaded', [
            'branches' => $query->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);
        abort_unless($request->user()->canManageBranches(), 403);

        $validated = $this->validateBranch($request);
        $this->entitlements->assertCanCreate($shop, 'branches');
        $branch = $shop->branches()->create($validated);

        $this->audit($request, 'branch.created', $shop->id, 'branch', $branch->id, [
            'name' => $branch->name,
            'status' => $branch->status,
        ]);
        $this->publicMenuCache->flushShop($shop->id);

        return $this->success('Branch created successfully', ['branch' => $branch], 201);
    }

    public function show(Request $request, Branch $branch)
    {
        $this->authorizeBranchAccess($request, $branch);

        return $this->success('Branch loaded', ['branch' => $branch->load('shop')]);
    }

    public function update(Request $request, Branch $branch)
    {
        $this->authorizeBranchAccess($request, $branch);
        abort_unless($request->user()->canManageBranches(), 403);
        $branch->update($this->validateBranch($request));

        $this->audit($request, 'branch.updated', $branch->shop_id, 'branch', $branch->id, [
            'name' => $branch->name,
            'status' => $branch->status,
        ]);
        $this->publicMenuCache->flushShop($branch->shop_id);

        return $this->success('Branch updated successfully', ['branch' => $branch->fresh()]);
    }

    public function destroy(Request $request, Branch $branch)
    {
        $this->authorizeBranchAccess($request, $branch);
        abort_unless($request->user()->canManageBranches(), 403);
        $branchId = $branch->id;
        $shopId = $branch->shop_id;
        $branchName = $branch->name;
        $branch->delete();

        $this->audit($request, 'branch.deleted', $shopId, 'branch', $branchId, [
            'name' => $branchName,
        ]);
        $this->publicMenuCache->flushShop($shopId);

        return $this->success('Branch deleted successfully');
    }

    private function validateBranch(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'google_map_url' => ['nullable', 'url', 'max:2048'],
            'opening_time' => ['nullable', 'date_format:H:i'],
            'closing_time' => ['nullable', 'date_format:H:i'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function authorizeShop(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
    }
}
