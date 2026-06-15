<?php

namespace App\Services\Payments;

use App\Models\Order;
use Illuminate\Support\Str;

class BakongKhqrProvider implements PaymentProviderInterface
{
    public function initiate(Order $order, array $data): PaymentResult
    {
        $reference = $data['provider_reference']
            ?? 'BKHQR-'.now()->format('Ymd').'-'.Str::upper(Str::random(8));
        $providerPaymentId = $data['provider_payment_id'] ?? 'sandbox_'.$order->id.'_'.Str::lower(Str::random(8));
        $expiresAt = now()->addMinutes(15);

        return new PaymentResult(
            status: 'pending',
            nextAction: 'show_qr',
            provider: 'bakong_khqr',
            providerPaymentId: $providerPaymentId,
            providerReference: $reference,
            qrPayload: $this->sandboxPayload($order, $reference),
            qrImageUrl: null,
            expiresAt: $expiresAt,
        );
    }

    private function sandboxPayload(Order $order, string $reference): string
    {
        $merchant = config('payment.bakong_khqr.merchant_id') ?: 'SANDBOX_MERCHANT';

        return implode('|', [
            'BAKONG_KHQR',
            'merchant='.$merchant,
            'ref='.$reference,
            'amount='.$order->grand_total,
            'currency='.$order->currency_code,
            'order='.$order->order_number,
        ]);
    }
}
