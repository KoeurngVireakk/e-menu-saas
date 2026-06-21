<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Shop;
use InvalidArgumentException;

class PaymentManager
{
    public function __construct(
        private readonly ManualPaymentProvider $manual,
        private readonly BakongKhqrProvider $bakongKhqr,
    ) {
    }

    public function initiate(Order $order, array $data): PaymentResult
    {
        $settings = $this->settings($order->shop);
        $this->ensureMethodEnabled($data['payment_method'], $settings);

        return match ($data['payment_method']) {
            'cash', 'khqr_manual' => $this->manual->initiate($order, $data),
            'bakong_khqr' => $this->bakongKhqr->initiate($order, $data),
            default => throw new InvalidArgumentException('Unsupported payment method.'),
        };
    }

    public function publicMethods(?Shop $shop = null): array
    {
        $settings = $shop ? $this->settings($shop) : [
            'cash_enabled' => true,
            'aba_enabled' => true,
            'bakong_enabled' => config('payment.sandbox_mode') || config('payment.bakong_khqr.enabled'),
        ];
        $methods = [];

        if ($settings['cash_enabled']) {
            $methods[] = ['value' => 'cash', 'label' => 'Cash'];
        }

        if ($settings['aba_enabled']) {
            $methods[] = ['value' => 'khqr_manual', 'label' => 'Manual KHQR / ABA'];
        }

        if ($settings['bakong_enabled'] && (config('payment.sandbox_mode') || config('payment.bakong_khqr.enabled'))) {
            $methods[] = ['value' => 'bakong_khqr', 'label' => 'Bakong KHQR'];
        }

        return $methods;
    }

    public function settings(Shop $shop): array
    {
        $settings = $shop->settings()->pluck('value', 'key');

        return [
            'cash_enabled' => filter_var($settings->get('cash_enabled', true), FILTER_VALIDATE_BOOLEAN),
            'aba_enabled' => filter_var($settings->get('aba_enabled', true), FILTER_VALIDATE_BOOLEAN),
            'bakong_enabled' => filter_var($settings->get('bakong_enabled', config('payment.sandbox_mode') || config('payment.bakong_khqr.enabled')), FILTER_VALIDATE_BOOLEAN),
            'proof_upload_required' => filter_var($settings->get('proof_upload_required', true), FILTER_VALIDATE_BOOLEAN),
            'auto_confirm_cash' => filter_var($settings->get('auto_confirm_cash', false), FILTER_VALIDATE_BOOLEAN),
            'payment_instructions' => $settings->get('payment_instructions', ''),
            'payment_qr_label' => $settings->get('payment_qr_label', ''),
        ];
    }

    private function ensureMethodEnabled(string $method, array $settings): void
    {
        $enabled = match ($method) {
            'cash' => $settings['cash_enabled'],
            'khqr_manual' => $settings['aba_enabled'],
            'bakong_khqr' => $settings['bakong_enabled'] && (config('payment.sandbox_mode') || config('payment.bakong_khqr.enabled')),
            default => false,
        };

        if (! $enabled) {
            throw new InvalidArgumentException('Unsupported payment method.');
        }
    }
}
