<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        return $this->success('Categories loaded', [
            'categories' => $shop->categories()->with('branch')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        $validated = $this->validateCategory($request, $shop);
        $validated['slug'] = $this->uniqueSlug($shop, $validated['name']);
        $validated['shop_id'] = $shop->id;
        $this->storeImage($request, $validated);

        $category = Category::create($validated);

        return $this->success('Category created successfully', ['category' => $category], 201);
    }

    public function show(Request $request, Category $category)
    {
        $this->authorizeShop($request, $category->shop);

        return $this->success('Category loaded', ['category' => $category->load('products')]);
    }

    public function update(Request $request, Category $category)
    {
        $this->authorizeShop($request, $category->shop);

        $validated = $this->validateCategory($request, $category->shop);
        if (($validated['name'] ?? $category->name) !== $category->name) {
            $validated['slug'] = $this->uniqueSlug($category->shop, $validated['name'], $category->id);
        }
        $this->storeImage($request, $validated);
        $category->update($validated);

        return $this->success('Category updated successfully', ['category' => $category->fresh()]);
    }

    public function destroy(Request $request, Category $category)
    {
        $this->authorizeShop($request, $category->shop);
        $category->delete();

        return $this->success('Category deleted successfully');
    }

    private function validateCategory(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function storeImage(Request $request, array &$validated): void
    {
        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('categories', 'public');
        }

        unset($validated['image']);
    }

    private function uniqueSlug(Shop $shop, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while ($shop->categories()->where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
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
