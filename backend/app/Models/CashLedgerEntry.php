<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashLedgerEntry extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'shift_id',
        'user_id',
        'source_type',
        'source_id',
        'entry_type',
        'direction',
        'amount',
        'currency_code',
        'description',
        'entry_date',
        'metadata_json',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'entry_date' => 'date',
            'metadata_json' => 'array',
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

    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashDrawerShift::class, 'shift_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
