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
            'shops' => Shop::query()
                ->select([
                    'id', 'owner_id', 'name', 'slug', 'phone', 'email', 'address', 'description',
                    'logo_path', 'cover_path', 'primary_color', 'secondary_color', 'currency_code', 'status',
                ])
                ->whereIn('id', $this->accessibleShopIds($request))
                ->latest('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->canManageShops(), 403);

        $validated = $this->validateShop($request);
        $validated['owner_id'] = $request->user()->id;
        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated += [
            'currency_code' => 'KHR',
            'status' => 'active',
        ];

        $this->storeUploads($request, $validated);

        $shop = Shop::create($validated);

        $this->audit($request, 'shop.created', $shop->id, 'shop', $shop->id, [
            'name' => $shop->name,
            'status' => $shop->status,
        ]);

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
        $this->authorizeShopManagement($request, $shop);

        $validated = $this->validateShop($request, $shop);
        if (($validated['name'] ?? $shop->name) !== $shop->name) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $shop->id);
        }

        $this->storeUploads($request, $validated);
        $shop->update($validated);

        $this->audit($request, 'shop.updated', $shop->id, 'shop', $shop->id, [
            'name' => $shop->name,
            'status' => $shop->status,
        ]);

        return $this->success('Shop updated successfully', ['shop' => $shop->fresh()]);
    }

    public function destroy(Request $request, Shop $shop)
    {
        $this->authorizeShopManagement($request, $shop);
        $shopId = $shop->id;
        $shopName = $shop->name;
        $shop->delete();

        $this->audit($request, 'shop.deleted', null, 'shop', $shopId, [
            'name' => $shopName,
        ]);

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
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:4096'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
        ]);
    }

    private function storeUploads(Request $request, array &$validated): void
    {
        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $this->storePublicImage($request, 'logo', 'shops/logos');
        }

        if ($request->hasFile('cover')) {
            $validated['cover_path'] = $this->storePublicImage($request, 'cover', 'shops/covers');
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
        $this->authorizeShopAccess($request, $shop);
    }

    private function authorizeShopManagement(Request $request, Shop $shop): void
    {
        abort_unless(
            $request->user()?->isSuperAdmin() || (int) $shop->owner_id === (int) $request->user()?->id,
            403
        );
    }
}
