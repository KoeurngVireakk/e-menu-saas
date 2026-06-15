<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Services\BillingCalculator;
use App\Services\Notifications\TelegramNotificationService;
use App\Services\Payments\PaymentManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PublicOrderController extends Controller
{
    public function __construct(
        private readonly BillingCalculator $billing,
        private readonly PaymentManager $payments,
        private readonly TelegramNotificationService $telegram,
    ) {
    }

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
            'items.*.selected_options.*.product_option_id' => ['required_with:items.*.selected_options', 'integer'],
            'items.*.selected_options.*.product_option_value_id' => ['nullable', 'integer'],
            'items.*.selected_options.*.product_option_value_ids' => ['nullable', 'array'],
            'items.*.selected_options.*.product_option_value_ids.*' => ['integer'],
            'items.*.selected_options.*.value_ids' => ['nullable', 'array'],
            'items.*.selected_options.*.value_ids.*' => ['integer'],
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

            foreach ($validated['items'] as $index => $item) {
                $product = Product::whereKey($item['product_id'])
                    ->where('shop_id', $shop->id)
                    ->where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branch->id))
                    ->where('status', 'active')
                    ->where('is_available', true)
                    ->with('options.values')
                    ->firstOrFail();

                [$selectedOptions, $optionTotal] = $this->selectedOptions($product, $item['selected_options'] ?? [], $index);
                $unitPrice = (float) ($product->discount_price ?? $product->price);
                $lineUnitPrice = $unitPrice + $optionTotal;
                $total = $lineUnitPrice * $item['quantity'];
                $subtotal += $total;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'discount_price' => $product->discount_price,
                    'total_price' => $total,
                    'note' => $item['note'] ?? null,
                    'selected_options_json' => $selectedOptions,
                ];
            }

            $totals = $this->billing->totals($subtotal, $shop);

            $order = Order::create([
                'order_number' => $this->orderNumber(),
                'shop_id' => $shop->id,
                'branch_id' => $branch->id,
                'dining_table_id' => $table?->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'order_type' => $validated['order_type'],
                ...$totals,
                'note' => $validated['note'] ?? null,
            ]);

            $order->items()->createMany($items);

            return $order->load(['items', 'shop', 'branch', 'diningTable']);
        });

        $this->telegram->notifyOrderCreated($order);

        return $this->success('Order submitted successfully', ['order' => $order], 201);
    }

    public function show(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with(['items', 'payment', 'shop', 'branch', 'diningTable'])->firstOrFail();

        return $this->success('Order loaded', [
            'order' => $order,
            'payment_methods' => $this->payments->publicMethods(),
        ]);
    }

    public function payment(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with(['shop', 'invoice'])->firstOrFail();
        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['cash', 'khqr_manual', 'bakong_khqr'])],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
            'proof_image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($validated['payment_method'] === 'khqr_manual') {
            $request->validate(['proof_image' => ['required', 'image', 'max:4096']]);
        }

        if ($request->hasFile('proof_image')) {
            $validated['proof_image_path'] = $request->file('proof_image')->store('payments', 'public');
        }

        unset($validated['proof_image']);
        $result = $this->payments->initiate($order, $validated);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            array_filter($result->paymentAttributes(), fn ($value) => $value !== null) + $validated + [
                'shop_id' => $order->shop_id,
                'branch_id' => $order->branch_id,
                'amount' => $order->grand_total,
                'currency_code' => $order->currency_code,
            ]
        );

        $payment->logs()->create([
            'action' => 'initiated',
            'payload_json' => [
                'method' => $payment->payment_method,
                'provider' => $payment->provider,
                'next_action' => $result->nextAction,
            ],
        ]);

        if ($payment->payment_method === 'khqr_manual' && filled($payment->proof_image_path)) {
            $this->telegram->notifyPaymentProofUploaded($payment);
        }

        $this->audit($request, 'payment.initiated', $payment->shop_id, 'payment', $payment->id, [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'payment_method' => $payment->payment_method,
            'provider' => $payment->provider,
            'amount' => $payment->amount,
            'currency_code' => $payment->currency_code,
        ]);

        $order->update(['payment_status' => $payment->payment_method === 'cash' ? 'pending' : 'pending']);

        return $this->success('Payment submitted successfully', [
            'payment' => $payment,
            ...$result->responsePayload(),
        ], 201);
    }

    private function orderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }

    private function selectedOptions(Product $product, array $selected, int $itemIndex): array
    {
        $options = $product->options;
        $selectedByOption = collect($selected)->keyBy('product_option_id');
        $sanitized = [];
        $optionTotal = 0;

        foreach ($selectedByOption->keys() as $optionId) {
            if (! $options->contains('id', (int) $optionId)) {
                throw ValidationException::withMessages([
                    "items.{$itemIndex}.selected_options" => ['One or more selected options do not belong to this product.'],
                ]);
            }
        }

        foreach ($options as $option) {
            $selection = $selectedByOption->get($option->id);

            if (! $selection) {
                if ($option->is_required) {
                    throw ValidationException::withMessages([
                        "items.{$itemIndex}.selected_options" => ["The {$option->name} option is required."],
                    ]);
                }

                continue;
            }

            $valueIds = $this->selectedValueIds($selection);

            if ($option->type === 'single' && count($valueIds) !== 1) {
                throw ValidationException::withMessages([
                    "items.{$itemIndex}.selected_options" => ["The {$option->name} option requires exactly one value."],
                ]);
            }

            if ($option->type === 'multiple' && $option->is_required && count($valueIds) < 1) {
                throw ValidationException::withMessages([
                    "items.{$itemIndex}.selected_options" => ["The {$option->name} option requires at least one value."],
                ]);
            }

            $values = $option->values->whereIn('id', $valueIds)->values();

            if ($values->count() !== count(array_unique($valueIds))) {
                throw ValidationException::withMessages([
                    "items.{$itemIndex}.selected_options" => ["One or more {$option->name} values are invalid."],
                ]);
            }

            $sanitizedValues = $values->map(function ($value) use (&$optionTotal) {
                $extraPrice = (float) $value->extra_price;
                $optionTotal += $extraPrice;

                return [
                    'product_option_value_id' => $value->id,
                    'name' => $value->name,
                    'extra_price' => $extraPrice,
                ];
            })->all();

            $sanitized[] = [
                'product_option_id' => $option->id,
                'name' => $option->name,
                'type' => $option->type,
                'values' => $sanitizedValues,
            ];
        }

        return [$sanitized, $optionTotal];
    }

    private function selectedValueIds(array $selection): array
    {
        $ids = $selection['product_option_value_ids']
            ?? $selection['value_ids']
            ?? $selection['values']
            ?? [];

        if (isset($selection['product_option_value_id'])) {
            $ids = [$selection['product_option_value_id']];
        }

        if (! is_array($ids)) {
            $ids = [$ids];
        }

        return array_values(array_unique(array_map('intval', $ids)));
    }
}
