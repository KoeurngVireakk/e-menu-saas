<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        return $this->success('Shops loaded', [
            'shops' => $request->user()->shops()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateShop($request);
        $validated['owner_id'] = $request->user()->id;
        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated += [
            'currency_code' => 'KHR',
            'status' => 'active',
        ];

        $this->storeUploads($request, $validated);

        $shop = Shop::create($validated);

        return $this->success('Shop created successfully', ['shop' => $shop], 201);
    }

    public function show(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        return $this->success('Shop loaded', [
            'shop' => $shop->load('branches'),
        ]);
    }

    public function update(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);

        $validated = $this->validateShop($request, $shop);
        if (($validated['name'] ?? $shop->name) !== $shop->name) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $shop->id);
        }

        $this->storeUploads($request, $validated);
        $shop->update($validated);

        return $this->success('Shop updated successfully', ['shop' => $shop->fresh()]);
    }

    public function destroy(Request $request, Shop $shop)
    {
        $this->authorizeShop($request, $shop);
        $shop->delete();

        return $this->success('Shop deleted successfully');
    }

    private function validateShop(Request $request, ?Shop $shop = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'cover' => ['nullable', 'image', 'max:4096'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
        ]);
    }

    private function storeUploads(Request $request, array &$validated): void
    {
        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('shops/logos', 'public');
        }

        if ($request->hasFile('cover')) {
            $validated['cover_path'] = $request->file('cover')->store('shops/covers', 'public');
        }

        unset($validated['logo'], $validated['cover']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while (Shop::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
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
