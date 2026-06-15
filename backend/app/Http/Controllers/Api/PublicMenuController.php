<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\Shop;
use Illuminate\Http\Request;

class PublicMenuController extends Controller
{
    private const SUPPORTED_LOCALES = ['en', 'km'];

    public function menu(Request $request, string $slug)
    {
        $locale = $this->locale($request);
        $shop = Shop::where('slug', $slug)->where('status', 'active')->with('translations')->firstOrFail();
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
                ->with(['translations', 'options.translations', 'options.values.translations'])
                ->orderBy('name')])
            ->with('translations')
            ->orderBy('sort_order')
            ->get();

        $table = $branch && $tableCode
            ? $branch->diningTables()->where('table_code', $tableCode)->where('status', 'active')->first()
            : null;

        return $this->success('Public menu loaded', [
            'current_locale' => $locale,
            'supported_locales' => self::SUPPORTED_LOCALES,
            'shop' => $this->localizedShop($shop, $locale),
            'branch' => $branch,
            'table' => $table,
            'categories' => $categories->map(fn (Category $category) => $this->localizedCategory($category, $locale))->values(),
        ]);
    }

    public function product(Request $request, string $slug, Product $product)
    {
        $locale = $this->locale($request);
        $shop = Shop::where('slug', $slug)->where('status', 'active')->firstOrFail();
        abort_unless($product->shop_id === $shop->id && $product->status === 'active' && $product->is_available, 404);

        return $this->success('Product loaded', [
            'current_locale' => $locale,
            'supported_locales' => self::SUPPORTED_LOCALES,
            'product' => $this->localizedProduct($product->load(['translations', 'category.translations', 'options.translations', 'options.values.translations']), $locale),
        ]);
    }

    private function locale(Request $request): string
    {
        $locale = $request->query('locale');

        return in_array($locale, self::SUPPORTED_LOCALES, true) ? $locale : 'en';
    }

    private function localizedShop(Shop $shop, string $locale): array
    {
        $data = $shop->toArray();
        $data['name'] = $shop->localizedName($locale);
        $data['description'] = $shop->localizedDescription($locale);
        $data['address'] = $shop->localizedAddress($locale);
        unset($data['translations']);

        return $data;
    }

    private function localizedCategory(Category $category, string $locale): array
    {
        $data = $category->toArray();
        $data['name'] = $category->localizedName($locale);
        $data['products'] = $category->products
            ->map(fn (Product $product) => $this->localizedProduct($product, $locale))
            ->values()
            ->all();
        unset($data['translations']);

        return $data;
    }

    private function localizedProduct(Product $product, string $locale): array
    {
        $data = $product->toArray();
        $data['name'] = $product->localizedName($locale);
        $data['description'] = $product->localizedDescription($locale);
        $data['options'] = $product->options
            ->map(fn (ProductOption $option) => $this->localizedOption($option, $locale))
            ->values()
            ->all();
        unset($data['translations']);

        if ($product->relationLoaded('category') && $product->category) {
            $data['category']['name'] = $product->category->localizedName($locale);
            unset($data['category']['translations']);
        }

        return $data;
    }

    private function localizedOption(ProductOption $option, string $locale): array
    {
        $data = $option->toArray();
        $data['name'] = $option->localizedName($locale);
        $data['values'] = $option->values
            ->map(function (ProductOptionValue $value) use ($locale) {
                $valueData = $value->toArray();
                $valueData['name'] = $value->localizedName($locale);
                unset($valueData['translations']);

                return $valueData;
            })
            ->values()
            ->all();
        unset($data['translations']);

        return $data;
    }
}
