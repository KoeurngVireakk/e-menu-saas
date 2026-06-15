<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\BillingCalculator;
use App\Services\Notifications\TelegramNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly BillingCalculator $billing,
        private readonly TelegramNotificationService $telegram,
    ) {
    }

    public function index(Request $request)
    {
        abort_unless($request->user()->canManagePayments(), 403);
        $shopIds = $this->accessibleShopIds($request);

        if (empty($shopIds)) {
            return $this->success('Invoices loaded', ['invoices' => []]);
        }

        $invoices = Invoice::with(['order', 'shop', 'branch'])
            ->whereIn('shop_id', $shopIds)
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status));

        $invoices->where(function ($query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function ($shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $this->success('Invoices loaded', [
            'invoices' => $invoices->latest()->get(),
        ]);
    }

    public function show(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoiceView($request, $invoice);

        return $this->success('Invoice loaded', [
            'invoice' => $invoice->load(['items', 'order.items', 'shop.settings', 'branch']),
            'settings' => $this->billing->settings($invoice->shop),
        ]);
    }

    public function store(Request $request, Order $order)
    {
        $this->authorizeInvoiceView($request, $order);
        abort_unless($request->user()->canManagePayments(), 403);

        $invoice = DB::transaction(function () use ($request, $order) {
            $order->load(['items', 'shop.settings']);
            $existing = $order->invoice()->with('items')->first();

            if ($existing) {
                return $existing;
            }

            $invoice = Invoice::create([
                'invoice_number' => $this->invoiceNumber($order),
                'order_id' => $order->id,
                'shop_id' => $order->shop_id,
                'branch_id' => $order->branch_id,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'currency_code' => $order->currency_code,
                'subtotal' => $order->subtotal,
                'discount_total' => $order->discount_total,
                'service_charge' => $order->service_charge,
                'tax_total' => $order->tax_total,
                'deposit_amount' => 0,
                'paid_amount' => $order->payment_status === 'paid' ? $order->grand_total : 0,
                'balance_due' => $order->payment_status === 'paid' ? 0 : $order->grand_total,
                'grand_total' => $order->grand_total,
                'status' => $order->payment_status === 'paid' ? 'paid' : 'issued',
                'issued_at' => now(),
                'paid_at' => $order->payment_status === 'paid' ? now() : null,
            ]);

            $invoice->items()->createMany($order->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'unit_price' => $item->discount_price ?? $item->unit_price,
                'total_price' => $item->total_price,
                'selected_options_json' => $item->selected_options_json,
            ])->all());

            $this->audit($request, 'invoice.created', $order->shop_id, 'invoice', $invoice->id, [
                'invoice_number' => $invoice->invoice_number,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'grand_total' => $invoice->grand_total,
                'currency_code' => $invoice->currency_code,
            ]);

            return $invoice;
        });

        return $this->success('Invoice created', [
            'invoice' => $invoice->fresh()->load(['items', 'order', 'shop', 'branch']),
        ], $invoice->wasRecentlyCreated ? 201 : 200);
    }

    public function markPaid(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoiceView($request, $invoice);
        abort_unless($request->user()->canManagePayments(), 403);

        DB::transaction(function () use ($request, $invoice) {
            $invoice->update([
                'status' => 'paid',
                'paid_amount' => $invoice->grand_total,
                'balance_due' => 0,
                'paid_at' => now(),
            ]);

            $invoice->order()->update(['payment_status' => 'paid']);

            $this->audit($request, 'invoice.marked_paid', $invoice->shop_id, 'invoice', $invoice->id, [
                'invoice_number' => $invoice->invoice_number,
                'order_id' => $invoice->order_id,
                'grand_total' => $invoice->grand_total,
                'currency_code' => $invoice->currency_code,
            ]);

            $this->telegram->notifyInvoicePaid($invoice->fresh()->load(['order', 'shop.settings', 'branch']));
        });

        return $this->success('Invoice marked paid', [
            'invoice' => $invoice->fresh()->load(['items', 'order']),
        ]);
    }

    public function cancel(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoiceView($request, $invoice);
        abort_unless($request->user()->canManagePayments(), 403);

        $invoice->update(['status' => 'cancelled']);

        $this->audit($request, 'invoice.cancelled', $invoice->shop_id, 'invoice', $invoice->id, [
            'invoice_number' => $invoice->invoice_number,
            'order_id' => $invoice->order_id,
        ]);

        return $this->success('Invoice cancelled', [
            'invoice' => $invoice->fresh()->load(['items', 'order']),
        ]);
    }

    private function authorizeInvoiceView(Request $request, Invoice|Order $record): void
    {
        abort_unless($request->user()->canManagePayments(), 403);
        abort_unless($request->user()->canAccessShop($record->shop_id, $record->branch_id), 403);
    }

    private function invoiceNumber(Order $order): string
    {
        $settings = $this->billing->settings($order->shop);
        $prefix = Str::upper(Str::slug($settings['invoice_prefix'] ?: 'INV', ''));

        do {
            $number = $prefix.'-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Invoice::where('invoice_number', $number)->exists());

        return $number;
    }
}
