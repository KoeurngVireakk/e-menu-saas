<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('restaurant.'.$this->order->shop_id),
            new PrivateChannel('branch.'.$this->order->branch_id),
            new PrivateChannel('order.'.$this->order->id),
            new PrivateChannel('kitchen.'.$this->order->branch_id),
            new PrivateChannel('admin.restaurant.'.$this->order->shop_id),
        ];

        if ($this->order->dining_table_id) {
            $channels[] = new PrivateChannel('table.'.$this->order->dining_table_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'restaurant_id' => $this->order->shop_id,
            'branch_id' => $this->order->branch_id,
            'table_id' => $this->order->dining_table_id,
            'status' => $this->order->order_status,
            'payment_status' => $this->order->payment_status,
            'total_amount' => (float) $this->order->grand_total,
            'currency_code' => $this->order->currency_code,
            'created_at' => $this->order->created_at?->toISOString(),
        ];
    }
}
