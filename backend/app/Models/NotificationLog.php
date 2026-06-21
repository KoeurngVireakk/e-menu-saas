<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationLog extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'channel',
        'event',
        'recipient',
        'status',
        'message_preview',
        'error_message',
        'metadata_json',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata_json' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function reads(): HasMany
    {
        return $this->hasMany(NotificationLogRead::class);
    }
}
