<?php

namespace App\Services;

use App\Models\CashDrawerShift;
use App\Models\CashLedgerEntry;
use App\Models\CashMovement;
use App\Models\DailyClosing;
use App\Models\Expense;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Model;

class CashLedgerService
{
    public function recordPayment(Payment $payment): ?CashLedgerEntry
    {
        if ($payment->status !== 'paid' || ! in_array($payment->payment_method, ['cash', 'khqr_manual', 'bakong_khqr'], true)) {
            return null;
        }

        return $this->record(
            $payment,
            'payment',
            'in',
            $payment->amount,
            $payment->currency_code,
            $payment->shop_id,
            $payment->branch_id,
            $payment->cash_drawer_shift_id,
            $payment->confirmed_by,
            'Payment confirmed',
            $payment->confirmed_at?->toDateString() ?: now()->toDateString(),
            [
                'payment_method' => $payment->payment_method,
                'provider' => $payment->provider,
                'order_id' => $payment->order_id,
            ],
        );
    }

    public function recordShiftOpening(CashDrawerShift $shift): ?CashLedgerEntry
    {
        if ((float) $shift->opening_float <= 0) {
            return null;
        }

        return $this->record(
            $shift,
            'opening_float',
            'in',
            $shift->opening_float,
            $shift->shop->currency_code ?? 'KHR',
            $shift->shop_id,
            $shift->branch_id,
            $shift->id,
            $shift->opened_by,
            'Shift opening float',
            $shift->opened_at?->toDateString() ?: now()->toDateString(),
            ['shift_code' => $shift->shift_code],
        );
    }

    public function recordCashMovement(CashMovement $movement): CashLedgerEntry
    {
        return $this->record(
            $movement,
            $movement->type,
            $movement->type === 'cash_in' ? 'in' : 'out',
            $movement->amount,
            $movement->shop->currency_code ?? 'KHR',
            $movement->shop_id,
            $movement->branch_id,
            $movement->shift_id,
            $movement->user_id,
            $movement->reason,
            $movement->created_at?->toDateString() ?: now()->toDateString(),
            ['reason' => $movement->reason],
        );
    }

    public function recordExpensePaid(Expense $expense, ?int $shiftId = null, ?int $userId = null): CashLedgerEntry
    {
        return $this->record(
            $expense,
            'expense',
            'out',
            $expense->amount,
            $expense->currency_code,
            $expense->shop_id,
            $expense->branch_id,
            $shiftId,
            $userId ?: $expense->created_by,
            'Expense paid',
            $expense->paid_at?->toDateString() ?: $expense->expense_date?->toDateString() ?: now()->toDateString(),
            [
                'expense_number' => $expense->expense_number,
                'payment_method' => $expense->payment_method,
                'vendor_name' => $expense->vendor_name,
            ],
        );
    }

    public function recordClosingDifference(DailyClosing|CashDrawerShift $source, float $difference, ?int $userId = null): ?CashLedgerEntry
    {
        if (abs($difference) < 0.01) {
            return null;
        }

        $entryDate = $source instanceof DailyClosing
            ? $source->closing_date?->toDateString()
            : $source->closed_at?->toDateString();

        return $this->record(
            $source,
            'closing_difference',
            $difference >= 0 ? 'in' : 'out',
            abs($difference),
            $source->currency_code ?? $source->shop->currency_code ?? 'KHR',
            $source->shop_id,
            $source->branch_id,
            $source instanceof CashDrawerShift ? $source->id : null,
            $userId,
            'Cash closing difference',
            $entryDate ?: now()->toDateString(),
            ['raw_difference' => $difference],
        );
    }

    private function record(
        Model $source,
        string $entryType,
        string $direction,
        mixed $amount,
        string $currencyCode,
        int $shopId,
        ?int $branchId,
        ?int $shiftId,
        ?int $userId,
        ?string $description,
        string $entryDate,
        array $metadata = [],
    ): CashLedgerEntry {
        return CashLedgerEntry::firstOrCreate(
            [
                'source_type' => $source::class,
                'source_id' => $source->getKey(),
                'entry_type' => $entryType,
            ],
            [
                'shop_id' => $shopId,
                'branch_id' => $branchId,
                'shift_id' => $shiftId,
                'user_id' => $userId,
                'direction' => $direction,
                'amount' => $amount,
                'currency_code' => $currencyCode,
                'description' => $description,
                'entry_date' => $entryDate,
                'metadata_json' => $this->safeMetadata($metadata),
            ],
        );
    }

    private function safeMetadata(array $metadata): array
    {
        return collect($metadata)
            ->reject(fn ($value, string|int $key) => is_string($key) && in_array(strtolower($key), [
                'password',
                'token',
                'authorization',
                'proof_image_path',
                'receipt_image_path',
            ], true))
            ->map(fn ($value) => is_string($value) ? str($value)->limit(500, '')->toString() : $value)
            ->all();
    }
}
