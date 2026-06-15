<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order, public string $oldStatus)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.'.$this->order->shop_id),
            new PrivateChannel('branch.'.$this->order->branch_id),
            new PrivateChannel('order.'.$this->order->id),
            new PrivateChannel('kitchen.'.$this->order->branch_id),
            new PrivateChannel('admin.restaurant.'.$this->order->shop_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'restaurant_id' => $this->order->shop_id,
            'branch_id' => $this->order->branch_id,
            'table_id' => $this->order->dining_table_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->order->order_status,
            'changed_at' => now()->toISOString(),
        ];
    }
}
