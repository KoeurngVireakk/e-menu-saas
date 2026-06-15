<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\PrintLog;
use App\Models\PrintStation;
use App\Services\BillingCalculator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class PrintController extends Controller
{
    public function __construct(private readonly BillingCalculator $billing)
    {
    }

    public function kitchenTicket(Request $request, Order $order)
    {
        $this->authorizePrintableOrder($request, $order);
        abort_unless($request->user()->canPrintKitchenTicket(), 403);

        $order->load(['items', 'shop', 'branch', 'diningTable']);
        $station = $this->defaultStation($order->shop_id, $order->branch_id, ['kitchen', 'bar']);
        $payload = [
            'print_type' => 'kitchen_ticket',
            'paper_size' => $station?->paper_size ?: '80mm',
            'generated_at' => now()->toIso8601String(),
            'station' => $this->stationPayload($station),
            'shop' => $this->shopPayload($order->shop),
            'branch' => $this->branchPayload($order->branch),
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_type' => $order->order_type,
                'order_status' => $order->order_status,
                'table' => $order->diningTable?->table_name,
                'note' => $order->note,
                'created_at' => $order->created_at?->toIso8601String(),
            ],
            'items' => $this->orderItemsPayload($order),
        ];

        $this->logPrint($request, $order, 'kitchen_ticket', $station, $payload);

        return $this->success('Kitchen ticket ready', ['print' => $payload]);
    }

    public function receipt(Request $request, Order $order)
    {
        $this->authorizePrintableOrder($request, $order);
        abort_unless($request->user()->canPrintReceipt(), 403);

        $order->load(['items', 'shop.settings', 'branch', 'diningTable', 'payment', 'invoice']);
        $settings = $this->billing->settings($order->shop);
        $station = $this->defaultStation($order->shop_id, $order->branch_id, ['receipt', 'cashier']);
        $payload = [
            'print_type' => 'receipt',
            'paper_size' => $station?->paper_size ?: '80mm',
            'generated_at' => now()->toIso8601String(),
            'station' => $this->stationPayload($station),
            'shop' => $this->shopPayload($order->shop),
            'branch' => $this->branchPayload($order->branch),
            'receipt_number' => $settings['receipt_prefix'].'-'.$order->order_number,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_type' => $order->order_type,
                'order_status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment?->payment_method,
                'table' => $order->diningTable?->table_name,
                'customer_name' => $order->customer_name,
                'created_at' => $order->created_at?->toIso8601String(),
            ],
            'items' => $this->orderItemsPayload($order),
            'totals' => $this->orderTotalsPayload($order),
            'settings' => [
                'receipt_footer_text' => $settings['receipt_footer_text'] ?? null,
            ],
        ];

        $this->logPrint($request, $order, 'receipt', $station, $payload);

        return $this->success('Receipt print ready', ['print' => $payload]);
    }

    public function invoice(Request $request, Invoice $invoice)
    {
        abort_unless($request->user()->canPrintReceipt(), 403);
        abort_unless($request->user()->canAccessShop($invoice->shop_id, $invoice->branch_id), 403);

        $invoice->load(['items', 'order.diningTable', 'shop.settings', 'branch']);
        $settings = $this->billing->settings($invoice->shop);
        $station = $this->defaultStation($invoice->shop_id, $invoice->branch_id, ['receipt', 'cashier']);
        $payload = [
            'print_type' => 'invoice',
            'paper_size' => $station?->paper_size ?: '80mm',
            'generated_at' => now()->toIso8601String(),
            'station' => $this->stationPayload($station),
            'shop' => $this->shopPayload($invoice->shop),
            'branch' => $this->branchPayload($invoice->branch),
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $invoice->status,
                'issued_at' => $invoice->issued_at?->toIso8601String(),
                'paid_at' => $invoice->paid_at?->toIso8601String(),
                'customer_name' => $invoice->customer_name,
                'customer_phone' => $invoice->customer_phone,
            ],
            'order' => [
                'id' => $invoice->order?->id,
                'order_number' => $invoice->order?->order_number,
                'order_type' => $invoice->order?->order_type,
                'table' => $invoice->order?->diningTable?->table_name,
            ],
            'items' => $invoice->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
                'selected_options' => $item->selected_options_json ?: [],
            ])->values(),
            'totals' => [
                'subtotal' => $invoice->subtotal,
                'discount_total' => $invoice->discount_total,
                'service_charge' => $invoice->service_charge,
                'tax_total' => $invoice->tax_total,
                'deposit_amount' => $invoice->deposit_amount,
                'paid_amount' => $invoice->paid_amount,
                'balance_due' => $invoice->balance_due,
                'grand_total' => $invoice->grand_total,
                'currency_code' => $invoice->currency_code,
            ],
            'settings' => [
                'receipt_footer_text' => $settings['receipt_footer_text'] ?? null,
            ],
        ];

        $this->logPrint($request, $invoice, 'invoice', $station, $payload);

        return $this->success('Invoice print ready', ['print' => $payload]);
    }

    private function authorizePrintableOrder(Request $request, Order $order): void
    {
        abort_unless($request->user()->canAccessShop($order->shop_id, $order->branch_id), 403);
    }

    private function defaultStation(int $shopId, ?int $branchId, array $types): ?PrintStation
    {
        foreach ($types as $type) {
            $station = PrintStation::where('shop_id', $shopId)
                ->where('type', $type)
                ->where('status', 'active')
                ->where('is_default', true)
                ->where(function ($query) use ($branchId) {
                    $query->where('branch_id', $branchId)->orWhereNull('branch_id');
                })
                ->orderByRaw('case when branch_id is null then 1 else 0 end')
                ->first();

            if ($station) {
                return $station;
            }
        }

        return PrintStation::where('shop_id', $shopId)
            ->whereIn('type', $types)
            ->where('status', 'active')
            ->where(function ($query) use ($branchId) {
                $query->where('branch_id', $branchId)->orWhereNull('branch_id');
            })
            ->orderByRaw('case when branch_id is null then 1 else 0 end')
            ->first();
    }

    private function logPrint(Request $request, Model $printable, string $type, ?PrintStation $station, array $payload): void
    {
        PrintLog::create([
            'shop_id' => $payload['shop']['id'],
            'branch_id' => $payload['branch']['id'] ?? null,
            'user_id' => $request->user()?->id,
            'printable_type' => $printable::class,
            'printable_id' => $printable->getKey(),
            'print_type' => $type,
            'print_station_id' => $station?->id,
            'status' => 'generated',
            'metadata_json' => [
                'paper_size' => $payload['paper_size'],
                'station_name' => $station?->name,
                'order_number' => $payload['order']['order_number'] ?? null,
                'invoice_number' => $payload['invoice']['invoice_number'] ?? null,
                'generated_at' => $payload['generated_at'],
            ],
            'created_at' => now(),
        ]);
    }

    private function orderItemsPayload(Order $order)
    {
        return $order->items->map(fn ($item) => [
            'id' => $item->id,
            'product_name' => $item->product_name,
            'quantity' => $item->quantity,
            'unit_price' => $item->unit_price,
            'discount_price' => $item->discount_price,
            'total_price' => $item->total_price,
            'note' => $item->note,
            'selected_options' => $item->selected_options_json ?: [],
        ])->values();
    }

    private function orderTotalsPayload(Order $order): array
    {
        return [
            'subtotal' => $order->subtotal,
            'discount_total' => $order->discount_total,
            'service_charge' => $order->service_charge,
            'tax_total' => $order->tax_total,
            'grand_total' => $order->grand_total,
            'currency_code' => $order->currency_code,
            'secondary_currency_code' => $order->secondary_currency_code,
            'secondary_currency_total' => $order->secondary_currency_total,
        ];
    }

    private function stationPayload(?PrintStation $station): ?array
    {
        if (! $station) {
            return null;
        }

        return [
            'id' => $station->id,
            'name' => $station->name,
            'type' => $station->type,
            'paper_size' => $station->paper_size,
        ];
    }

    private function shopPayload(mixed $shop): array
    {
        return [
            'id' => $shop->id,
            'name' => $shop->name,
            'phone' => $shop->phone,
            'address' => $shop->address,
            'currency_code' => $shop->currency_code,
        ];
    }

    private function branchPayload(mixed $branch): ?array
    {
        if (! $branch) {
            return null;
        }

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'phone' => $branch->phone,
            'address' => $branch->address,
        ];
    }
}
