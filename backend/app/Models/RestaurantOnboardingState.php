<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantOnboardingState extends Model
{
    protected $fillable = [
        'user_id',
        'shop_id',
        'current_step',
        'completed_steps_json',
        'is_dismissed',
        'completed_at',
        'last_resumed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_steps_json' => 'array',
            'is_dismissed' => 'boolean',
            'completed_at' => 'datetime',
            'last_resumed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
