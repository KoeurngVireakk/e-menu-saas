<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashDrawerShift extends Model
{
    protected $fillable = [
        'shop_id',
        'branch_id',
        'user_id',
        'opened_by',
        'closed_by',
        'shift_code',
        'opening_float',
        'expected_cash_total',
        'counted_cash_total',
        'cash_difference',
        'cash_in_total',
        'cash_out_total',
        'note',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'opening_float' => 'decimal:2',
            'expected_cash_total' => 'decimal:2',
            'counted_cash_total' => 'decimal:2',
            'cash_difference' => 'decimal:2',
            'cash_in_total' => 'decimal:2',
            'cash_out_total' => 'decimal:2',
            'opened_at' => 'datetime',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(CashMovement::class, 'shift_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'cash_drawer_shift_id');
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(CashLedgerEntry::class, 'shift_id');
    }
}
