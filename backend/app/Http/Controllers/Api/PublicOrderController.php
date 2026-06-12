<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PublicOrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'exists:shops,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'table_code' => ['nullable', 'string'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'order_type' => ['required', Rule::in(['dine_in', 'takeaway'])],
            'note' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.note' => ['nullable', 'string'],
            'items.*.selected_options' => ['nullable', 'array'],
        ]);

        $shop = Shop::whereKey($validated['shop_id'])->where('status', 'active')->firstOrFail();
        $branch = Branch::whereKey($validated['branch_id'])->where('shop_id', $shop->id)->where('status', 'active')->firstOrFail();
        $table = isset($validated['table_code'])
            ? $branch->diningTables()
                ->where('table_code', $validated['table_code'])
                ->where('status', 'active')
                ->first()
            : null;

        if (isset($validated['table_code']) && ! $table) {
            throw ValidationException::withMessages([
                'table_code' => ['The selected table is not available for this branch.'],
            ]);
        }

        $order = DB::transaction(function () use ($validated, $shop, $branch, $table) {
            $subtotal = 0;
            $items = [];

            foreach ($validated['items'] as $item) {
                $product = Product::whereKey($item['product_id'])
                    ->where('shop_id', $shop->id)
                    ->where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branch->id))
                    ->where('status', 'active')
                    ->where('is_available', true)
                    ->firstOrFail();

                $unitPrice = $product->discount_price ?? $product->price;
                $total = $unitPrice * $item['quantity'];
                $subtotal += $total;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'discount_price' => $product->discount_price,
                    'total_price' => $total,
                    'note' => $item['note'] ?? null,
                    'selected_options_json' => $item['selected_options'] ?? null,
                ];
            }

            $order = Order::create([
                'order_number' => $this->orderNumber(),
                'shop_id' => $shop->id,
                'branch_id' => $branch->id,
                'dining_table_id' => $table?->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'order_type' => $validated['order_type'],
                'subtotal' => $subtotal,
                'discount_total' => 0,
                'service_charge' => 0,
                'tax_total' => 0,
                'grand_total' => $subtotal,
                'note' => $validated['note'] ?? null,
            ]);

            $order->items()->createMany($items);

            return $order->load(['items', 'shop', 'branch', 'diningTable']);
        });

        return $this->success('Order submitted successfully', ['order' => $order], 201);
    }

    public function show(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with(['items', 'payment', 'shop', 'branch', 'diningTable'])->firstOrFail();

        return $this->success('Order loaded', ['order' => $order]);
    }

    public function payment(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('shop')->firstOrFail();
        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['cash', 'aba_manual', 'khqr_manual'])],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
            'proof_image' => ['nullable', 'image', 'max:4096'],
        ]);

        if (in_array($validated['payment_method'], ['aba_manual', 'khqr_manual'], true)) {
            $request->validate(['proof_image' => ['required', 'image', 'max:4096']]);
        }

        if ($request->hasFile('proof_image')) {
            $validated['proof_image_path'] = $request->file('proof_image')->store('payments', 'public');
        }

        unset($validated['proof_image']);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            $validated + [
                'shop_id' => $order->shop_id,
                'branch_id' => $order->branch_id,
                'amount' => $order->grand_total,
                'currency_code' => $order->shop->currency_code,
                'status' => 'pending',
            ]
        );

        $payment->logs()->create([
            'action' => 'submitted',
            'payload_json' => ['method' => $payment->payment_method],
        ]);

        $order->update(['payment_status' => $payment->payment_method === 'cash' ? 'pending' : 'pending']);

        return $this->success('Payment submitted successfully', ['payment' => $payment], 201);
    }

    private function orderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
