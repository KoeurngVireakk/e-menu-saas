<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);
        $query = $this->scopeBranchAccess(
            $request,
            $shop->products()->with(['category', 'branch', 'options.values'])->latest(),
            $shop->id,
            'branch_id',
            true
        );

        return $this->success('Products loaded', [
            'products' => $query->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);
        abort_unless($request->user()->canManageCatalog(), 403);

        $validated = $this->validateProduct($request, $shop);
        $this->authorizeScopedWrite($request, $shop, $validated['branch_id'] ?? null);
        $this->validateCategoryBranch($validated);
        $options = $validated['options'] ?? [];
        unset($validated['options']);

        $validated['shop_id'] = $shop->id;
        $validated['slug'] = $this->uniqueSlug($shop, $validated['name']);
        $this->storeImage($request, $validated);

        $product = Product::create($validated);
        $this->syncOptions($product, $options);

        $this->audit($request, 'product.created', $shop->id, 'product', $product->id, [
            'name' => $product->name,
            'branch_id' => $product->branch_id,
            'category_id' => $product->category_id,
            'status' => $product->status,
            'option_count' => count($options),
        ]);

        return $this->success('Product created successfully', ['product' => $product->load('options.values')], 201);
    }

    public function show(Request $request, Product $product)
    {
        $this->authorizeShopAccess($request, $product->shop, $product->branch_id);

        return $this->success('Product loaded', ['product' => $product->load(['category', 'branch', 'options.values'])]);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeShopAccess($request, $product->shop, $product->branch_id);
        abort_unless($request->user()->canManageCatalog(), 403);

        $validated = $this->validateProduct($request, $product->shop);
        $this->authorizeScopedWrite($request, $product->shop, $validated['branch_id'] ?? null);
        $this->validateCategoryBranch($validated);
        $options = $validated['options'] ?? null;
        unset($validated['options']);

        if (($validated['name'] ?? $product->name) !== $product->name) {
            $validated['slug'] = $this->uniqueSlug($product->shop, $validated['name'], $product->id);
        }
        $this->storeImage($request, $validated);
        $product->update($validated);

        if (is_array($options)) {
            $product->options()->delete();
            $this->syncOptions($product, $options);
        }

        $this->audit($request, 'product.updated', $product->shop_id, 'product', $product->id, [
            'name' => $product->name,
            'branch_id' => $product->branch_id,
            'category_id' => $product->category_id,
            'status' => $product->status,
            'options_changed' => is_array($options),
        ]);

        return $this->success('Product updated successfully', ['product' => $product->fresh()->load('options.values')]);
    }

    public function destroy(Request $request, Product $product)
    {
        $this->authorizeShopAccess($request, $product->shop, $product->branch_id);
        abort_unless($request->user()->canManageCatalog(), 403);
        $productId = $product->id;
        $shopId = $product->shop_id;
        $productName = $product->name;
        $product->delete();

        $this->audit($request, 'product.deleted', $shopId, 'product', $productId, [
            'name' => $productName,
        ]);

        return $this->success('Product deleted successfully');
    }

    private function validateProduct(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'category_id' => ['required', Rule::exists('categories', 'id')->where('shop_id', $shop->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:4096'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'preparation_time_minutes' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'options' => ['nullable', 'array'],
            'options.*.name' => ['required_with:options', 'string', 'max:255'],
            'options.*.type' => ['required_with:options', Rule::in(['single', 'multiple'])],
            'options.*.is_required' => ['nullable', 'boolean'],
            'options.*.values' => ['nullable', 'array'],
            'options.*.values.*.name' => ['required_with:options.*.values', 'string', 'max:255'],
            'options.*.values.*.extra_price' => ['nullable', 'numeric', 'min:0'],
        ]);
    }

    private function storeImage(Request $request, array &$validated): void
    {
        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storePublicImage($request, 'image', 'products');
        }

        unset($validated['image']);
    }

    private function syncOptions(Product $product, array $options): void
    {
        foreach ($options as $optionData) {
            $values = $optionData['values'] ?? [];
            unset($optionData['values']);
            $option = $product->options()->create($optionData);

            foreach ($values as $valueData) {
                $option->values()->create($valueData);
            }
        }
    }

    private function uniqueSlug(Shop $shop, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while ($shop->products()->where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function authorizeShop(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
    }

    private function authorizeScopedWrite(Request $request, Shop $shop, ?int $branchId): void
    {
        abort_unless(
            $branchId !== null || $request->user()->accessibleBranchIdsForShop($shop->id) === null,
            403
        );

        $this->authorizeShopAccess($request, $shop, $branchId);
    }

    private function validateCategoryBranch(array $validated): void
    {
        $category = Category::findOrFail($validated['category_id']);
        $branchId = $validated['branch_id'] ?? null;

        abort_unless($category->branch_id === null || (int) $category->branch_id === (int) $branchId, 422, 'The selected category is not available for this branch.');
    }
}
