<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrintStation extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'name',
        'type',
        'paper_size',
        'is_default',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
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
}
