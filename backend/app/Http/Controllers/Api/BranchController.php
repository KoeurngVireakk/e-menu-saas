<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        return $this->success('Branches loaded', [
            'branches' => $shop->branches()->latest()->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        $branch = $shop->branches()->create($this->validateBranch($request));

        return $this->success('Branch created successfully', ['branch' => $branch], 201);
    }

    public function show(Request $request, Branch $branch)
    {
        $this->authorizeShop($request, $branch->shop);

        return $this->success('Branch loaded', ['branch' => $branch->load('shop')]);
    }

    public function update(Request $request, Branch $branch)
    {
        $this->authorizeShop($request, $branch->shop);
        $branch->update($this->validateBranch($request));

        return $this->success('Branch updated successfully', ['branch' => $branch->fresh()]);
    }

    public function destroy(Request $request, Branch $branch)
    {
        $this->authorizeShop($request, $branch->shop);
        $branch->delete();

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
        abort_unless($shop->owner_id === $request->user()->id || $request->user()->role === 'super_admin', 403);
    }
}
