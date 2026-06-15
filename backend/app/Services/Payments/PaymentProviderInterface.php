<?php

namespace App\Services\Payments;

use App\Models\Order;

interface PaymentProviderInterface
{
    public function initiate(Order $order, array $data): PaymentResult;
}
