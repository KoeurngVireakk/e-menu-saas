<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;

class PublicMenuController extends Controller
{
    public function menu(Request $request, string $slug)
    {
        $shop = Shop::where('slug', $slug)->where('status', 'active')->firstOrFail();
        $branchId = $request->query('branch');
        $tableCode = $request->query('table');

        $branch = $branchId
            ? $shop->branches()->whereKey($branchId)->where('status', 'active')->first()
            : $shop->branches()->where('status', 'active')->first();

        $categories = $shop->categories()
            ->where('status', 'active')
            ->when($branch, fn ($query) => $query->where(fn ($nested) => $nested->whereNull('branch_id')->orWhere('branch_id', $branch->id)))
            ->with(['products' => fn ($query) => $query
                ->where('status', 'active')
                ->where('is_available', true)
                ->when($branch, fn ($productQuery) => $productQuery->where(fn ($nested) => $nested->whereNull('branch_id')->orWhere('branch_id', $branch->id)))
                ->with('options.values')
                ->orderBy('name')])
            ->orderBy('sort_order')
            ->get();

        $table = $branch && $tableCode
            ? $branch->diningTables()->where('table_code', $tableCode)->where('status', 'active')->first()
            : null;

        return $this->success('Public menu loaded', [
            'shop' => $shop,
            'branch' => $branch,
            'table' => $table,
            'categories' => $categories,
        ]);
    }

    public function product(string $slug, Product $product)
    {
        $shop = Shop::where('slug', $slug)->where('status', 'active')->firstOrFail();
        abort_unless($product->shop_id === $shop->id && $product->status === 'active' && $product->is_available, 404);

        return $this->success('Product loaded', [
            'product' => $product->load(['category', 'options.values']),
        ]);
    }
}
