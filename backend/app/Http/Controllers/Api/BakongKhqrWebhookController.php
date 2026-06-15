<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payments\PaymentStatusSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BakongKhqrWebhookController extends Controller
{
    public function __construct(private readonly PaymentStatusSync $paymentStatusSync)
    {
    }

    public function __invoke(Request $request)
    {
        if (! $this->validSignature($request)) {
            return $this->error('Invalid webhook signature.', status: 401);
        }

        $payload = $request->validate([
            'provider_reference' => ['nullable', 'string', 'max:255'],
            'provider_payment_id' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'failure_reason' => ['nullable', 'string', 'max:500'],
        ]);

        if (! filled($payload['provider_reference'] ?? null) && ! filled($payload['provider_payment_id'] ?? null)) {
            return $this->error('Payment reference is required.', status: 422);
        }

        $payment = Payment::with('order.invoice')
            ->where('provider', 'bakong_khqr')
            ->where(function ($query) use ($payload) {
                $query
                    ->when($payload['provider_reference'] ?? null, fn ($nested, $reference) => $nested->orWhere('provider_reference', $reference))
                    ->when($payload['provider_payment_id'] ?? null, fn ($nested, $id) => $nested->orWhere('provider_payment_id', $id));
            })
            ->first();

        if (! $payment) {
            return $this->error('Payment not found.', status: 404);
        }

        DB::transaction(function () use ($request, $payment, $payload) {
            $payment->update(['webhook_verified_at' => now()]);
            $payment->logs()->create([
                'action' => 'bakong_webhook_received',
                'payload_json' => $this->safePayload($payload),
            ]);

            $status = strtolower($payload['status']);

            if (in_array($status, ['paid', 'success', 'completed'], true)) {
                if (! $this->amountMatches($payment, $payload)) {
                    $this->paymentStatusSync->markFailed($payment, 'Amount or currency mismatch');
                    $payment->logs()->create([
                        'action' => 'bakong_failed',
                        'payload_json' => $this->safePayload($payload) + ['reason' => 'Amount or currency mismatch'],
                    ]);

                    $this->audit($request, 'payment.bakong_failed', $payment->shop_id, 'payment', $payment->id, [
                        'provider' => 'bakong_khqr',
                        'order_id' => $payment->order_id,
                        'status' => 'amount_mismatch',
                    ]);

                    return;
                }

                $this->paymentStatusSync->markPaid($payment, ['webhook_verified_at' => now()]);
                $payment->logs()->create([
                    'action' => 'bakong_paid',
                    'payload_json' => $this->safePayload($payload),
                ]);

                $this->audit($request, 'payment.webhook_paid', $payment->shop_id, 'payment', $payment->id, [
                    'provider' => 'bakong_khqr',
                    'order_id' => $payment->order_id,
                    'provider_reference' => $payment->provider_reference,
                ]);

                return;
            }

            if (in_array($status, ['failed', 'expired', 'cancelled'], true)) {
                $this->paymentStatusSync->markFailed($payment, $payload['failure_reason'] ?? $status);
                $payment->logs()->create([
                    'action' => 'bakong_failed',
                    'payload_json' => $this->safePayload($payload),
                ]);

                $this->audit($request, 'payment.bakong_failed', $payment->shop_id, 'payment', $payment->id, [
                    'provider' => 'bakong_khqr',
                    'order_id' => $payment->order_id,
                    'status' => $status,
                ]);
            }
        });

        return $this->success('Webhook processed');
    }

    private function validSignature(Request $request): bool
    {
        $secret = config('payment.bakong_khqr.webhook_secret');
        if (! filled($secret)) {
            return true;
        }

        $signature = (string) $request->header('X-Bakong-Signature', '');
        if ($signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }

    private function safePayload(array $payload): array
    {
        return collect($payload)
            ->only(['provider_reference', 'provider_payment_id', 'status', 'amount', 'currency_code', 'failure_reason'])
            ->all();
    }

    private function amountMatches(Payment $payment, array $payload): bool
    {
        if (isset($payload['currency_code']) && strtoupper($payload['currency_code']) !== $payment->currency_code) {
            return false;
        }

        if (! isset($payload['amount'])) {
            return true;
        }

        return abs((float) $payload['amount'] - (float) $payment->amount) < 0.01;
    }
}
