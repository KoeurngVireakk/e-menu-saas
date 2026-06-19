<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashDrawerShift;
use App\Models\Payment;
use App\Services\CashLedgerService;
use App\Services\Notifications\TelegramNotificationService;
use App\Services\OperationsEventService;
use App\Services\Payments\PaymentStatusSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentStatusSync $paymentStatusSync,
        private readonly TelegramNotificationService $telegram,
        private readonly CashLedgerService $ledger,
        private readonly OperationsEventService $operationsEvents,
    ) {
    }

    public function index(Request $request)
    {
        $shopIds = $this->accessibleShopIds($request);

        if (empty($shopIds)) {
            return $this->success('Payments loaded', [
                'payments' => [],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $this->paginationLimit($request),
                    'total' => 0,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                    'has_more_pages' => false,
                ],
            ]);
        }

        $paymentsQuery = Payment::with(['order.items', 'shop', 'branch', 'confirmer', 'logs'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('payment_method'), fn ($query, $method) => $query->where('payment_method', $method))
            ->when($request->query('date'), fn ($query, $date) => $query->whereDate('created_at', $date));

        $paymentsQuery->where(function ($query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function ($shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        $paginator = $paymentsQuery->latest()->paginate($this->paginationLimit($request));

        return $this->success('Payments loaded', [
            'payments' => $paginator->items(),
            'pagination' => $this->paginationMeta($paginator),
        ]);
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
            $shift = $payment->payment_method === 'cash'
                ? CashDrawerShift::where('shop_id', $payment->shop_id)
                    ->where('branch_id', $payment->branch_id)
                    ->where('user_id', $request->user()->id)
                    ->where('status', 'open')
                    ->latest('opened_at')
                    ->first()
                : null;

            $this->paymentStatusSync->markPaid($payment->load('order.invoice'), [
                'confirmed_by' => $request->user()->id,
                'cash_drawer_shift_id' => $shift?->id,
                'confirmed_at' => now(),
            ]);
            $payment->refresh();
            $this->ledger->recordPayment($payment);

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

            if ($payment->order->invoice) {
                $this->telegram->notifyInvoicePaid($payment->order->invoice);
            }
        });
        $this->operationsEvents->broadcastPaymentConfirmed($payment->fresh(['order']));

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

            $this->telegram->notifyPaymentFailed($payment, $validated['reason'] ?? null);
        });

        return $this->success('Payment rejected', ['payment' => $payment->fresh()->load('order')]);
    }

    private function authorizePayment(Request $request, Payment $payment): void
    {
        abort_unless($request->user()->canAccessShop($payment->shop_id, $payment->branch_id), 403);
    }
}
