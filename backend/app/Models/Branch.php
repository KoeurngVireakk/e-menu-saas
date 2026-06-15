<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'name',
        'phone',
        'address',
        'google_map_url',
        'opening_time',
        'closing_time',
        'status',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function diningTables(): HasMany
    {
        return $this->hasMany(DiningTable::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function printStations(): HasMany
    {
        return $this->hasMany(PrintStation::class);
    }

    public function dailyClosings(): HasMany
    {
        return $this->hasMany(DailyClosing::class);
    }

    public function cashDrawerShifts(): HasMany
    {
        return $this->hasMany(CashDrawerShift::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function cashLedgerEntries(): HasMany
    {
        return $this->hasMany(CashLedgerEntry::class);
    }

    public function staffAssignments(): HasMany
    {
        return $this->hasMany(ShopStaff::class);
    }
}
