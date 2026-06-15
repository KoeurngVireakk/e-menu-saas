<?php

namespace App\Services\Payments;

use App\Models\Order;
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
        return match ($data['payment_method']) {
            'cash', 'khqr_manual' => $this->manual->initiate($order, $data),
            'bakong_khqr' => $this->bakongKhqr->initiate($order, $data),
            default => throw new InvalidArgumentException('Unsupported payment method.'),
        };
    }

    public function publicMethods(): array
    {
        $methods = [
            ['value' => 'cash', 'label' => 'Cash'],
            ['value' => 'khqr_manual', 'label' => 'Manual KHQR'],
        ];

        if (config('payment.sandbox_mode') || config('payment.bakong_khqr.enabled')) {
            $methods[] = ['value' => 'bakong_khqr', 'label' => 'Bakong KHQR'];
        }

        return $methods;
    }
}
