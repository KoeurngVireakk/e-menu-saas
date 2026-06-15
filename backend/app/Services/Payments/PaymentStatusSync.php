<?php

namespace App\Services\Payments;

use App\Models\Payment;

class PaymentStatusSync
{
    public function markPaid(Payment $payment, array $paymentAttributes = []): void
    {
        $payment->update($paymentAttributes + [
            'status' => 'paid',
            'failure_reason' => null,
        ]);

        $payment->order()->update(['payment_status' => 'paid']);

        $invoice = $payment->order->invoice;
        if ($invoice) {
            $invoice->update([
                'status' => 'paid',
                'paid_amount' => $payment->amount,
                'balance_due' => 0,
                'paid_at' => now(),
            ]);
        }
    }

    public function markFailed(Payment $payment, ?string $reason = null): void
    {
        $payment->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);

        $payment->order()->update(['payment_status' => 'failed']);
    }
}
