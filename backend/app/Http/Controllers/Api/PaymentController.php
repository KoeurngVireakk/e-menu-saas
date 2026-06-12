<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $shopIds = $this->accessibleShopIds($request);

        $payments = Payment::with(['order.items', 'shop', 'branch', 'confirmer'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

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

        DB::transaction(function () use ($request, $payment) {
            $payment->update([
                'status' => 'paid',
                'confirmed_by' => $request->user()->id,
                'confirmed_at' => now(),
            ]);

            $payment->order->update(['payment_status' => 'paid']);

            $payment->logs()->create([
                'action' => 'confirmed',
                'payload_json' => ['confirmed_by' => $request->user()->id],
            ]);
        });

        return $this->success('Payment confirmed', ['payment' => $payment->fresh()->load('order')]);
    }

    public function reject(Request $request, Payment $payment)
    {
        $this->authorizePayment($request, $payment);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($payment, $validated) {
            $payment->update(['status' => 'failed']);
            $payment->order->update(['payment_status' => 'failed']);
            $payment->logs()->create([
                'action' => 'rejected',
                'payload_json' => $validated,
            ]);
        });

        return $this->success('Payment rejected', ['payment' => $payment->fresh()->load('order')]);
    }

    private function accessibleShopIds(Request $request): array
    {
        if ($request->user()->role === 'super_admin') {
            return Shop::pluck('id')->all();
        }

        return $request->user()->shops()->pluck('id')->all();
    }

    private function authorizePayment(Request $request, Payment $payment): void
    {
        abort_unless(in_array($payment->shop_id, $this->accessibleShopIds($request), true), 403);
    }
}
