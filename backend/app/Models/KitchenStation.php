<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KitchenStation extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'name',
        'type',
        'category_ids_json',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'category_ids_json' => 'array',
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
