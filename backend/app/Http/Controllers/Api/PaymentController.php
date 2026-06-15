<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payments\PaymentStatusSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentStatusSync $paymentStatusSync)
    {
    }

    public function index(Request $request)
    {
        $shopIds = $this->accessibleShopIds($request);

        if (empty($shopIds)) {
            return $this->success('Payments loaded', ['payments' => []]);
        }

        $payments = Payment::with(['order.items', 'shop', 'branch', 'confirmer', 'logs'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status));

        $payments->where(function ($query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function ($shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        $payments = $payments->latest()->get();

        return $this->success('Payments loaded', ['payments' => $payments]);
    }

    public function show(Request $request, Payment $payment)
    {
        $this->authorizePayment($request, $payment);

        return $this->success('Payment loaded', [
            'payment' => $payment->load(['order.items', 'shop', 'branch', 'logs', 'confirmer']),
        ]);
    }

    public function confirm(Request $request, Payment $payment)
    {
        $this->authorizePayment($request, $payment);
        abort_unless($request->user()->canManagePayments(), 403);

        DB::transaction(function () use ($request, $payment) {
            $this->paymentStatusSync->markPaid($payment->load('order.invoice'), [
                'confirmed_by' => $request->user()->id,
                'confirmed_at' => now(),
            ]);

            $payment->logs()->create([
                'action' => 'confirmed',
                'payload_json' => ['confirmed_by' => $request->user()->id],
            ]);

            $this->audit($request, 'payment.confirmed', $payment->shop_id, 'payment', $payment->id, [
                'order_id' => $payment->order_id,
                'order_number' => $payment->order->order_number,
                'amount' => $payment->amount,
                'currency_code' => $payment->currency_code,
            ]);
        });

        return $this->success('Payment confirmed', ['payment' => $payment->fresh()->load('order.invoice')]);
    }

    public function reject(Request $request, Payment $payment)
    {
        $this->authorizePayment($request, $payment);
        abort_unless($request->user()->canManagePayments(), 403);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($request, $payment, $validated) {
            $this->paymentStatusSync->markFailed($payment->load('order'), $validated['reason'] ?? null);
            $payment->logs()->create([
                'action' => 'rejected',
                'payload_json' => $validated,
            ]);

            $this->audit($request, 'payment.rejected', $payment->shop_id, 'payment', $payment->id, [
                'order_id' => $payment->order_id,
                'order_number' => $payment->order->order_number,
                'has_reason' => filled($validated['reason'] ?? null),
            ]);
        });

        return $this->success('Payment rejected', ['payment' => $payment->fresh()->load('order')]);
    }

    private function authorizePayment(Request $request, Payment $payment): void
    {
        abort_unless($request->user()->canAccessShop($payment->shop_id, $payment->branch_id), 403);
    }
}
