<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        return $this->success('Products loaded', [
            'products' => $shop->products()->with(['category', 'branch', 'options.values'])->latest()->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        $validated = $this->validateProduct($request, $shop);
        $options = $validated['options'] ?? [];
        unset($validated['options']);

        $validated['shop_id'] = $shop->id;
        $validated['slug'] = $this->uniqueSlug($shop, $validated['name']);
        $this->storeImage($request, $validated);

        $product = Product::create($validated);
        $this->syncOptions($product, $options);

        return $this->success('Product created successfully', ['product' => $product->load('options.values')], 201);
    }

    public function show(Request $request, Product $product)
    {
        $this->authorizeShop($request, $product->shop);

        return $this->success('Product loaded', ['product' => $product->load(['category', 'branch', 'options.values'])]);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeShop($request, $product->shop);

        $validated = $this->validateProduct($request, $product->shop);
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

        return $this->success('Product updated successfully', ['product' => $product->fresh()->load('options.values')]);
    }

    public function destroy(Request $request, Product $product)
    {
        $this->authorizeShop($request, $product->shop);
        $product->delete();

        return $this->success('Product deleted successfully');
    }

    private function validateProduct(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'category_id' => ['required', Rule::exists('categories', 'id')->where('shop_id', $shop->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
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
            $validated['image_path'] = $request->file('image')->store('products', 'public');
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
        abort_unless($shop->owner_id === $request->user()->id || $request->user()->role === 'super_admin', 403);
    }
}
