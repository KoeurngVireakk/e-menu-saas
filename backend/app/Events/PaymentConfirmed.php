<?php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Payment $payment)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.'.$this->payment->shop_id),
            new PrivateChannel('branch.'.$this->payment->branch_id),
            new PrivateChannel('order.'.$this->payment->order_id),
            new PrivateChannel('admin.restaurant.'.$this->payment->shop_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'payment.confirmed';
    }

    public function broadcastWith(): array
    {
        $order = $this->payment->relationLoaded('order') ? $this->payment->order : $this->payment->order()->first();

        return [
            'payment_id' => $this->payment->id,
            'order_id' => $this->payment->order_id,
            'order_number' => $order?->order_number,
            'restaurant_id' => $this->payment->shop_id,
            'branch_id' => $this->payment->branch_id,
            'status' => $this->payment->status,
            'amount' => (float) $this->payment->amount,
            'currency_code' => $this->payment->currency_code,
            'confirmed_at' => $this->payment->confirmed_at?->toISOString(),
        ];
    }
}
