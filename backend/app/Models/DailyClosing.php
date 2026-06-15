<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyClosing extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'closing_date',
        'opened_by',
        'closed_by',
        'currency_code',
        'expected_cash_total',
        'counted_cash_total',
        'cash_difference',
        'payment_totals_json',
        'sales_summary_json',
        'note',
        'status',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'closing_date' => 'date',
            'expected_cash_total' => 'decimal:2',
            'counted_cash_total' => 'decimal:2',
            'cash_difference' => 'decimal:2',
            'payment_totals_json' => 'array',
            'sales_summary_json' => 'array',
            'closed_at' => 'datetime',
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

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}
