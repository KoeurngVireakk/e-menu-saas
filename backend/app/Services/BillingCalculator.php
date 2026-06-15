<?php

namespace App\Services;

use App\Models\Shop;

class BillingCalculator
{
    public function settings(Shop $shop): array
    {
        $settings = $shop->settings()->pluck('value', 'key');
        $baseCurrency = $this->currency($settings->get('base_currency') ?: $shop->currency_code ?: 'KHR', 'KHR');
        $secondaryCurrency = $this->currency($settings->get('secondary_currency'), $baseCurrency === 'KHR' ? 'USD' : 'KHR');

        if ($secondaryCurrency === $baseCurrency) {
            $secondaryCurrency = $baseCurrency === 'KHR' ? 'USD' : 'KHR';
        }

        return [
            'base_currency' => $baseCurrency,
            'display_secondary_currency' => filter_var($settings->get('display_secondary_currency', false), FILTER_VALIDATE_BOOLEAN),
            'secondary_currency' => $secondaryCurrency,
            'exchange_rate' => max(0.0001, (float) $settings->get('exchange_rate', 4100)),
            'service_charge_percentage' => max(0, (float) $settings->get('service_charge_percentage', 0)),
            'tax_percentage' => max(0, (float) $settings->get('tax_percentage', 0)),
            'default_discount_percentage' => max(0, (float) $settings->get('default_discount_percentage', 0)),
            'receipt_footer_text' => $settings->get('receipt_footer_text'),
            'invoice_prefix' => $settings->get('invoice_prefix') ?: 'INV',
            'receipt_prefix' => $settings->get('receipt_prefix') ?: 'RCPT',
        ];
    }

    public function totals(float $subtotal, Shop $shop): array
    {
        $settings = $this->settings($shop);
        $discountTotal = $this->round($subtotal * ($settings['default_discount_percentage'] / 100));
        $taxableBase = max(0, $subtotal - $discountTotal);
        $serviceCharge = $this->round($taxableBase * ($settings['service_charge_percentage'] / 100));
        $taxTotal = $this->round($taxableBase * ($settings['tax_percentage'] / 100));
        $grandTotal = $this->round($taxableBase + $serviceCharge + $taxTotal);

        return [
            'subtotal' => $this->round($subtotal),
            'discount_total' => $discountTotal,
            'service_charge' => $serviceCharge,
            'tax_total' => $taxTotal,
            'grand_total' => $grandTotal,
            'currency_code' => $settings['base_currency'],
            'secondary_currency_code' => $settings['display_secondary_currency'] ? $settings['secondary_currency'] : null,
            'secondary_currency_total' => $settings['display_secondary_currency']
                ? $this->secondaryTotal($grandTotal, $settings['base_currency'], $settings['secondary_currency'], $settings['exchange_rate'])
                : null,
        ];
    }

    private function secondaryTotal(float $amount, string $baseCurrency, string $secondaryCurrency, float $exchangeRate): float
    {
        if ($baseCurrency === 'KHR' && $secondaryCurrency === 'USD') {
            return $this->round($amount / $exchangeRate);
        }

        if ($baseCurrency === 'USD' && $secondaryCurrency === 'KHR') {
            return $this->round($amount * $exchangeRate);
        }

        return $this->round($amount);
    }

    private function currency(?string $currency, string $fallback): string
    {
        $currency = strtoupper((string) $currency);

        return in_array($currency, ['KHR', 'USD'], true) ? $currency : $fallback;
    }

    private function round(float $amount): float
    {
        return round($amount, 2);
    }
}
