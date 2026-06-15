<?php

namespace App\Events;

use App\Models\DiningTable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableActivityUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public DiningTable $table, public array $activity = [])
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.'.$this->table->shop_id),
            new PrivateChannel('branch.'.$this->table->branch_id),
            new PrivateChannel('table.'.$this->table->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'table.activity_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'table_id' => $this->table->id,
            'restaurant_id' => $this->table->shop_id,
            'branch_id' => $this->table->branch_id,
            'table_name' => $this->table->table_name,
            'status' => $this->table->status,
            'activity' => $this->safeActivity(),
            'updated_at' => now()->toISOString(),
        ];
    }

    private function safeActivity(): array
    {
        return collect($this->activity)
            ->reject(fn ($value, string|int $key) => is_string($key) && in_array(strtolower($key), [
                'token',
                'authorization',
                'password',
                'proof_image_path',
                'webhook_secret',
            ], true))
            ->all();
    }
}
