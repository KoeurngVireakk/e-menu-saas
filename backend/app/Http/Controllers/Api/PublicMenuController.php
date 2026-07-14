<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\Shop;
use App\Services\PublicMenuCacheService;
use Illuminate\Http\Request;

class PublicMenuController extends Controller
{
    private const SUPPORTED_LOCALES = ['en', 'km'];

    public function __construct(
        private readonly PublicMenuCacheService $publicMenuCache,
    ) {
    }

    public function menu(Request $request, string $slug)
    {
        $locale = $this->locale($request);
        $shop = Shop::where('slug', $slug)->where('status', 'active')->with('translations')->firstOrFail();
        $branchId = $request->query('branch');
        $tableCode = $request->query('table');

        $branch = $branchId
            ? $shop->branches()->whereKey($branchId)->where('status', 'active')->first()
            : $shop->branches()->where('status', 'active')->first();

        $cacheKey = $this->publicMenuCache->menuKey(
            $shop->id,
            $branch?->id,
            $tableCode ? (string) $tableCode : null,
            $locale,
        );

        $payload = $this->publicMenuCache->rememberMenu($cacheKey, function () use ($shop, $branch, $tableCode, $locale): array {
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
                ? $branch->diningTables()
                    ->where(fn ($query) => $query->where('qr_token', $tableCode)->orWhere('table_code', $tableCode))
                    ->where('status', 'active')
                    ->first()
                : null;

            return [
                'current_locale' => $locale,
                'supported_locales' => self::SUPPORTED_LOCALES,
                'shop' => $this->localizedShop($shop, $locale),
                'branch' => $branch ? $this->publicBranch($branch) : null,
                'table' => $table ? $this->publicTable($table) : null,
                'categories' => $categories->map(fn (Category $category) => $this->localizedCategory($category, $locale))->values()->all(),
            ];
        });

        return $this->success('menu loaded', $payload);
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
        return [
            'id' => $shop->id,
            'name' => $shop->localizedName($locale),
            'slug' => $shop->slug,
            'phone' => $shop->is_demo ? null : $shop->phone,
            'email' => $shop->is_demo ? null : $shop->email,
            'address' => $shop->localizedAddress($locale),
            'description' => $shop->localizedDescription($locale),
            'logo_path' => $shop->logo_path,
            'cover_path' => $shop->cover_path,
            'primary_color' => $shop->primary_color,
            'secondary_color' => $shop->secondary_color,
            'currency_code' => $shop->currency_code,
            'is_demo' => $shop->is_demo,
            'demo' => $shop->is_demo ? [
                'mode' => 'read_only',
                'checkout_mode' => 'simulated',
                'message' => 'Demo workspace: checkout is simulated and no payment or personal data is stored.',
            ] : null,
        ];
    }

    private function localizedCategory(Category $category, string $locale): array
    {
        return [
            'id' => $category->id,
            'branch_id' => $category->branch_id,
            'name' => $category->localizedName($locale),
            'slug' => $category->slug,
            'image_path' => $category->image_path,
            'sort_order' => $category->sort_order,
            'products' => $category->products
                ->map(fn (Product $product) => $this->localizedProduct($product, $locale))
                ->values()
                ->all(),
        ];
    }

    private function localizedProduct(Product $product, string $locale): array
    {
        $data = [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'branch_id' => $product->branch_id,
            'name' => $product->localizedName($locale),
            'slug' => $product->slug,
            'description' => $product->localizedDescription($locale),
            'image_path' => $product->image_path,
            'price' => $product->price,
            'discount_price' => $product->discount_price,
            'preparation_time_minutes' => $product->preparation_time_minutes,
            'is_featured' => $product->is_featured,
            'options' => $product->options
                ->map(fn (ProductOption $option) => $this->localizedOption($option, $locale))
                ->values()
                ->all(),
        ];

        if ($product->relationLoaded('category') && $product->category) {
            $data['category'] = [
                'id' => $product->category->id,
                'name' => $product->category->localizedName($locale),
            ];
        }

        return $data;
    }

    private function localizedOption(ProductOption $option, string $locale): array
    {
        return [
            'id' => $option->id,
            'product_id' => $option->product_id,
            'name' => $option->localizedName($locale),
            'type' => $option->type,
            'is_required' => $option->is_required,
            'sort_order' => $option->sort_order,
            'values' => $option->values
                ->map(fn (ProductOptionValue $value) => [
                    'id' => $value->id,
                    'product_option_id' => $value->product_option_id,
                    'name' => $value->localizedName($locale),
                    'extra_price' => $value->extra_price,
                    'sort_order' => $value->sort_order,
                ])
                ->values()
                ->all(),
        ];
    }

    private function publicBranch(Branch $branch): array
    {
        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'address' => $branch->address,
            'opening_time' => $branch->opening_time,
            'closing_time' => $branch->closing_time,
        ];
    }

    private function publicTable(DiningTable $table): array
    {
        return [
            'id' => $table->id,
            'table_name' => $table->table_name,
            'table_code' => $table->table_code,
        ];
    }
}
