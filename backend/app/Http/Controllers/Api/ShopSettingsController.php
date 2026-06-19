<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Services\BillingCalculator;
use App\Services\Notifications\TelegramNotificationService;
use App\Services\PublicMenuCacheService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShopSettingsController extends Controller
{
    private const SETTING_KEYS = [
        'order_auto_accept',
        'base_currency',
        'display_secondary_currency',
        'secondary_currency',
        'exchange_rate',
        'service_charge_percentage',
        'tax_percentage',
        'default_discount_percentage',
        'receipt_footer_text',
        'invoice_prefix',
        'receipt_prefix',
        'telegram_enabled',
        'telegram_chat_id',
        'telegram_order_notifications',
        'telegram_payment_notifications',
        'telegram_invoice_notifications',
    ];

    public function __construct(
        private readonly BillingCalculator $billing,
        private readonly TelegramNotificationService $telegram,
        private readonly PublicMenuCacheService $publicMenuCache,
    ) {
    }

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
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:4096'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'currency_code' => ['required', Rule::in(['KHR', 'USD'])],
            'order_auto_accept' => ['nullable', 'boolean'],
            'base_currency' => ['nullable', Rule::in(['KHR', 'USD'])],
            'display_secondary_currency' => ['nullable', 'boolean'],
            'secondary_currency' => ['nullable', Rule::in(['KHR', 'USD'])],
            'exchange_rate' => ['nullable', 'numeric', 'min:0.0001'],
            'service_charge_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'default_discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'receipt_footer_text' => ['nullable', 'string', 'max:1000'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'receipt_prefix' => ['nullable', 'string', 'max:20'],
            'telegram_enabled' => ['nullable', 'boolean'],
            'telegram_chat_id' => ['nullable', 'string', 'max:255'],
            'telegram_order_notifications' => ['nullable', 'boolean'],
            'telegram_payment_notifications' => ['nullable', 'boolean'],
            'telegram_invoice_notifications' => ['nullable', 'boolean'],
        ]);

        $validated['base_currency'] = $validated['base_currency'] ?? $validated['currency_code'];
        $validated['secondary_currency'] = $validated['secondary_currency'] ?? ($validated['base_currency'] === 'KHR' ? 'USD' : 'KHR');
        if ($validated['secondary_currency'] === $validated['base_currency']) {
            $validated['secondary_currency'] = $validated['base_currency'] === 'KHR' ? 'USD' : 'KHR';
        }
        $validated['currency_code'] = $validated['base_currency'];

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
        $this->publicMenuCache->flushShop($shop->id);

        return $this->success('Shop settings updated', [
            'shop' => $shop->fresh()->load('settings'),
            'settings' => $this->settingsPayload($shop->fresh()),
        ]);
    }

    public function testTelegram(Request $request, Shop $shop)
    {
        $this->authorizeSettingsManagement($request, $shop);

        $log = $this->telegram->sendTest($shop);

        return $this->success('Telegram test notification processed', [
            'notification' => [
                'id' => $log->id,
                'status' => $log->status,
                'event' => $log->event,
                'message_preview' => $log->message_preview,
                'error_message' => $log->error_message,
                'sent_at' => $log->sent_at,
            ],
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
            ...$this->billing->settings($shop),
            ...$this->telegram->settings($shop),
        ];
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

    private function stringSettingValue(string $key, mixed $value): string
    {
        if (in_array($key, [
            'order_auto_accept',
            'display_secondary_currency',
            'telegram_enabled',
            'telegram_order_notifications',
            'telegram_payment_notifications',
            'telegram_invoice_notifications',
        ], true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
        }

        return (string) ($value ?? '');
    }
}
