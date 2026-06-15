<?php

namespace App\Services\Payments;

use App\Models\Order;

class ManualPaymentProvider implements PaymentProviderInterface
{
    public function initiate(Order $order, array $data): PaymentResult
    {
        $method = $data['payment_method'];

        return new PaymentResult(
            status: 'pending',
            nextAction: $method === 'cash' ? 'none' : 'upload_proof',
            provider: 'manual',
            providerReference: $data['transaction_reference'] ?? null,
        );
    }
}
