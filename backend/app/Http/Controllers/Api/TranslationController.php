<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\Shop;
use App\Services\PublicMenuCacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TranslationController extends Controller
{
    private const SUPPORTED_LOCALES = ['en', 'km'];

    public function __construct(
        private readonly PublicMenuCacheService $publicMenuCache,
    ) {
    }

    public function shop(Request $request, Shop $shop)
    {
        $this->authorizeCatalogView($request, $shop);

        $categories = $this->scopeBranchAccess(
            $request,
            $shop->categories()
                ->with([
                    'translations',
                    'products' => fn ($query) => $this->scopeBranchAccess(
                        $request,
                        $query->with([
                            'translations',
                            'options.translations',
                            'options.values.translations',
                        ]),
                        $shop->id,
                        'branch_id',
                        true
                    ),
                ])
                ->orderBy('sort_order'),
            $shop->id,
            'branch_id',
            true
        )->get();

        return $this->success('Translations loaded', [
            'supported_locales' => self::SUPPORTED_LOCALES,
            'shop' => $shop->load('translations'),
            'categories' => $categories,
        ]);
    }

    public function updateShop(Request $request, Shop $shop)
    {
        $this->authorizeWholeShopTranslation($request, $shop);
        $translations = $this->validatedTranslations($request, [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ]);

        foreach ($translations as $locale => $data) {
            $shop->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $this->audit($request, 'translations.updated', $shop->id, 'shop', $shop->id, [
            'locales' => array_keys($translations),
        ]);
        $this->publicMenuCache->flushShop($shop->id);

        return $this->success('Shop translations updated', [
            'shop' => $shop->refresh()->load('translations'),
        ]);
    }

    public function updateCategory(Request $request, Category $category)
    {
        $this->authorizeCatalogEntity($request, $category->shop, $category->branch_id);
        $translations = $this->validatedTranslations($request, [
            'name' => ['required', 'string', 'max:255'],
        ]);

        foreach ($translations as $locale => $data) {
            $category->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $this->audit($request, 'translations.updated', $category->shop_id, 'category', $category->id, [
            'locales' => array_keys($translations),
        ]);
        $this->publicMenuCache->flushShop($category->shop_id);

        return $this->success('Category translations updated', [
            'category' => $category->refresh()->load('translations'),
        ]);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $this->authorizeCatalogEntity($request, $product->shop, $product->branch_id);
        $translations = $this->validatedTranslations($request, [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        foreach ($translations as $locale => $data) {
            $product->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $this->audit($request, 'translations.updated', $product->shop_id, 'product', $product->id, [
            'locales' => array_keys($translations),
        ]);
        $this->publicMenuCache->flushShop($product->shop_id);

        return $this->success('Product translations updated', [
            'product' => $product->refresh()->load('translations'),
        ]);
    }

    public function updateOption(Request $request, ProductOption $option)
    {
        $product = $option->product()->with('shop')->firstOrFail();
        $this->authorizeCatalogEntity($request, $product->shop, $product->branch_id);
        $translations = $this->validatedTranslations($request, [
            'name' => ['required', 'string', 'max:255'],
        ]);

        foreach ($translations as $locale => $data) {
            $option->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $this->audit($request, 'translations.updated', $product->shop_id, 'product_option', $option->id, [
            'product_id' => $product->id,
            'locales' => array_keys($translations),
        ]);
        $this->publicMenuCache->flushShop($product->shop_id);

        return $this->success('Product option translations updated', [
            'option' => $option->refresh()->load('translations'),
        ]);
    }

    public function updateOptionValue(Request $request, ProductOptionValue $value)
    {
        $option = $value->option()->with('product.shop')->firstOrFail();
        $product = $option->product;
        $this->authorizeCatalogEntity($request, $product->shop, $product->branch_id);
        $translations = $this->validatedTranslations($request, [
            'name' => ['required', 'string', 'max:255'],
        ]);

        foreach ($translations as $locale => $data) {
            $value->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $this->audit($request, 'translations.updated', $product->shop_id, 'product_option_value', $value->id, [
            'product_id' => $product->id,
            'option_id' => $option->id,
            'locales' => array_keys($translations),
        ]);
        $this->publicMenuCache->flushShop($product->shop_id);

        return $this->success('Product option value translations updated', [
            'value' => $value->refresh()->load('translations'),
        ]);
    }

    private function authorizeCatalogView(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canManageCatalog(), 403);
    }

    private function authorizeWholeShopTranslation(Request $request, Shop $shop): void
    {
        $this->authorizeCatalogView($request, $shop);
        abort_unless($request->user()->accessibleBranchIdsForShop($shop->id) === null, 403);
    }

    private function authorizeCatalogEntity(Request $request, Shop $shop, ?int $branchId): void
    {
        $this->authorizeShopAccess($request, $shop, $branchId);
        abort_unless($request->user()->canManageCatalog(), 403);
        abort_unless($branchId !== null || $request->user()->accessibleBranchIdsForShop($shop->id) === null, 403);
    }

    private function validatedTranslations(Request $request, array $rules): array
    {
        $payload = $request->validate([
            'translations' => ['required', 'array'],
        ]);

        $translations = [];
        foreach ($payload['translations'] as $locale => $data) {
            if (! in_array($locale, self::SUPPORTED_LOCALES, true)) {
                throw ValidationException::withMessages([
                    'translations' => 'Unsupported locale.',
                ]);
            }

            if (! is_array($data)) {
                throw ValidationException::withMessages([
                    "translations.{$locale}" => 'Translation values must be an object.',
                ]);
            }

            $translations[$locale] = Validator::make($data, $rules)->validate();
        }

        return $translations;
    }
}
