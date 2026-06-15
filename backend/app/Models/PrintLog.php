<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PrintLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'shop_id',
        'branch_id',
        'user_id',
        'printable_type',
        'printable_id',
        'print_type',
        'print_station_id',
        'status',
        'metadata_json',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata_json' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function printable(): MorphTo
    {
        return $this->morphTo();
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function printStation(): BelongsTo
    {
        return $this->belongsTo(PrintStation::class);
    }
}
