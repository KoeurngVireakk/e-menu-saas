<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopSettingsController extends Controller
{
    private const SETTING_KEYS = [
        'order_auto_accept',
        'service_charge_percentage',
        'tax_percentage',
    ];

    public function show(Request $request, Shop $shop)
    {
        $this->authorizeSettingsView($request, $shop);

        return $this->success('Shop settings loaded', [
            'shop' => $shop->load('settings'),
            'settings' => $this->settingsPayload($shop),
        ]);
    }

    public function update(Request $request, Shop $shop)
    {
        $this->authorizeSettingsManagement($request, $shop);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'cover' => ['nullable', 'image', 'max:4096'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'currency_code' => ['required', 'string', 'size:3'],
            'order_auto_accept' => ['nullable', 'boolean'],
            'service_charge_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $shopFields = collect($validated)->except(self::SETTING_KEYS)->all();
        $this->storeUploads($request, $shopFields);
        $shop->update($shopFields);

        foreach (self::SETTING_KEYS as $key) {
            if (array_key_exists($key, $validated)) {
                $shop->settings()->updateOrCreate(
                    ['key' => $key],
                    ['value' => $this->stringSettingValue($key, $validated[$key])]
                );
            }
        }

        $this->audit($request, 'shop.settings_updated', $shop->id, 'shop', $shop->id, [
            'changed_keys' => array_keys($validated),
        ]);

        return $this->success('Shop settings updated', [
            'shop' => $shop->fresh()->load('settings'),
            'settings' => $this->settingsPayload($shop->fresh()),
        ]);
    }

    private function authorizeSettingsView(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canViewTenantSettings(), 403);
    }

    private function authorizeSettingsManagement(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canManageTenantSettings(), 403);
    }

    private function settingsPayload(Shop $shop): array
    {
        $settings = $shop->settings()->pluck('value', 'key');

        return [
            'order_auto_accept' => filter_var($settings->get('order_auto_accept', false), FILTER_VALIDATE_BOOLEAN),
            'service_charge_percentage' => (float) $settings->get('service_charge_percentage', 0),
            'tax_percentage' => (float) $settings->get('tax_percentage', 0),
        ];
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

    private function stringSettingValue(string $key, mixed $value): string
    {
        if ($key === 'order_auto_accept') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
        }

        return (string) ($value ?? 0);
    }
}
