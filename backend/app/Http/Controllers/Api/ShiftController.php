<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawerShift;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->canViewShifts(), 403);

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', Rule::in(['open', 'closed', 'cancelled'])],
            'date' => ['nullable', 'date'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $date = $validated['date'] ?? now()->toDateString();
        $dateFrom = $validated['date_from'] ?? $date;
        $dateTo = $validated['date_to'] ?? $date;

        $shifts = CashDrawerShift::with(['shop', 'branch', 'user', 'opener', 'closer'])
            ->whereIn('shop_id', $shopIds)
            ->whereBetween('opened_at', [
                CarbonImmutable::parse($dateFrom)->startOfDay(),
                CarbonImmutable::parse($dateTo)->endOfDay(),
            ])
            ->when(isset($validated['branch_id']), fn ($query) => $query->where('branch_id', $validated['branch_id']))
            ->when(isset($validated['user_id']), fn ($query) => $query->where('user_id', $validated['user_id']))
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status));

        if (! $request->user()->canManageShift()) {
            $shifts->where('user_id', $request->user()->id);
        }

        $shifts->where(function (Builder $query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $this->success('Shifts loaded', [
            'shifts' => $shifts->latest('opened_at')->get(),
        ]);
    }

    public function open(Request $request)
    {
        abort_unless($request->user()->canOpenShift(), 403);

        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'branch_id' => ['required', 'integer', Rule::exists('branches', 'id')->where('shop_id', $request->integer('shop_id'))],
            'opening_float' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $branch = Branch::with('shop')->findOrFail($validated['branch_id']);
        abort_unless($request->user()->canAccessShop($branch->shop_id, $branch->id), 403);

        $duplicate = CashDrawerShift::where('shop_id', $branch->shop_id)
            ->where('branch_id', $branch->id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->exists();

        if ($duplicate) {
            return $this->error('This user already has an open shift for this branch.', [
                'shift' => ['Close the current shift before opening another one.'],
            ], 409);
        }

        $shift = CashDrawerShift::create([
            'shop_id' => $branch->shop_id,
            'branch_id' => $branch->id,
            'user_id' => $request->user()->id,
            'opened_by' => $request->user()->id,
            'shift_code' => $this->shiftCode(),
            'opening_float' => $validated['opening_float'],
            'expected_cash_total' => $validated['opening_float'],
            'note' => $validated['note'] ?? null,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $this->audit($request, 'shift.opened', $shift->shop_id, 'cash_drawer_shift', $shift->id, [
            'branch_id' => $shift->branch_id,
            'user_id' => $shift->user_id,
            'shift_code' => $shift->shift_code,
            'opening_float' => $shift->opening_float,
        ]);

        return $this->success('Shift opened', [
            'shift' => $shift->load(['shop', 'branch', 'user']),
        ], 201);
    }

    public function show(Request $request, CashDrawerShift $shift)
    {
        $this->authorizeShiftView($request, $shift);

        return $this->success('Shift loaded', [
            'shift' => $this->shiftPayload($shift),
        ]);
    }

    public function cashMovement(Request $request, CashDrawerShift $shift)
    {
        $this->authorizeShiftAction($request, $shift);
        abort_unless($request->user()->canAddCashMovement(), 403);
        abort_unless($shift->status === 'open', 409);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['cash_in', 'cash_out'])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $movement = DB::transaction(function () use ($request, $shift, $validated) {
            $movement = $shift->movements()->create([
                'shop_id' => $shift->shop_id,
                'branch_id' => $shift->branch_id,
                'user_id' => $request->user()->id,
                ...$validated,
            ]);

            $field = $movement->type === 'cash_in' ? 'cash_in_total' : 'cash_out_total';
            $shift->increment($field, $movement->amount);

            $this->audit($request, 'shift.'.$movement->type, $shift->shop_id, 'cash_drawer_shift', $shift->id, [
                'movement_id' => $movement->id,
                'branch_id' => $shift->branch_id,
                'amount' => $movement->amount,
                'reason' => $movement->reason,
            ]);

            return $movement;
        });

        return $this->success('Cash movement added', [
            'movement' => $movement,
            'shift' => $this->shiftPayload($shift->fresh()),
        ], 201);
    }

    public function close(Request $request, CashDrawerShift $shift)
    {
        $this->authorizeShiftAction($request, $shift);
        abort_unless($request->user()->canCloseShift(), 403);
        abort_unless($shift->status === 'open', 409);

        $validated = $request->validate([
            'counted_cash_total' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $closedAt = now();
        $cashPayments = $this->cashPaymentTotal($shift, $closedAt);
        $expected = (float) $shift->opening_float + $cashPayments + (float) $shift->cash_in_total - (float) $shift->cash_out_total;
        $counted = (float) $validated['counted_cash_total'];

        $shift->update([
            'expected_cash_total' => $expected,
            'counted_cash_total' => $counted,
            'cash_difference' => $counted - $expected,
            'closed_by' => $request->user()->id,
            'closed_at' => $closedAt,
            'status' => 'closed',
            'note' => $validated['note'] ?? $shift->note,
        ]);

        $this->audit($request, 'shift.closed', $shift->shop_id, 'cash_drawer_shift', $shift->id, [
            'branch_id' => $shift->branch_id,
            'user_id' => $shift->user_id,
            'shift_code' => $shift->shift_code,
            'cash_payments' => $cashPayments,
            'expected_cash_total' => $shift->expected_cash_total,
            'counted_cash_total' => $shift->counted_cash_total,
            'cash_difference' => $shift->cash_difference,
        ]);

        return $this->success('Shift closed', [
            'shift' => $this->shiftPayload($shift->fresh()),
        ]);
    }

    public function cancel(Request $request, CashDrawerShift $shift)
    {
        $this->authorizeShiftView($request, $shift);
        abort_unless($request->user()->canManageShift(), 403);
        abort_unless($shift->status === 'open', 409);

        $shift->update([
            'status' => 'cancelled',
            'closed_by' => $request->user()->id,
            'closed_at' => now(),
        ]);

        $this->audit($request, 'shift.cancelled', $shift->shop_id, 'cash_drawer_shift', $shift->id, [
            'branch_id' => $shift->branch_id,
            'user_id' => $shift->user_id,
            'shift_code' => $shift->shift_code,
        ]);

        return $this->success('Shift cancelled', [
            'shift' => $this->shiftPayload($shift->fresh()),
        ]);
    }

    public function report(Request $request, CashDrawerShift $shift)
    {
        $this->authorizeShiftView($request, $shift);

        return $this->success('Shift report loaded', [
            'report' => $this->shiftPayload($shift),
        ]);
    }

    private function authorizeShiftView(Request $request, CashDrawerShift $shift): void
    {
        abort_unless($request->user()->canViewShifts(), 403);
        abort_unless($request->user()->canAccessShop($shift->shop_id, $shift->branch_id), 403);

        if (! $request->user()->canManageShift()) {
            abort_unless((int) $shift->user_id === (int) $request->user()->id, 403);
        }
    }

    private function authorizeShiftAction(Request $request, CashDrawerShift $shift): void
    {
        $this->authorizeShiftView($request, $shift);

        if (! $request->user()->canManageShift()) {
            abort_unless((int) $shift->user_id === (int) $request->user()->id, 403);
        }
    }

    private function cashPaymentTotal(CashDrawerShift $shift, mixed $closedAt): float
    {
        return (float) Payment::where('shop_id', $shift->shop_id)
            ->where('branch_id', $shift->branch_id)
            ->where('payment_method', 'cash')
            ->where('status', 'paid')
            ->where(function (Builder $query) use ($shift, $closedAt) {
                $query->where('cash_drawer_shift_id', $shift->id)
                    ->orWhere(function (Builder $nested) use ($shift, $closedAt) {
                        $nested->where('confirmed_by', $shift->user_id)
                            ->whereBetween('confirmed_at', [$shift->opened_at, $closedAt]);
                    });
            })
            ->sum('amount');
    }

    private function shiftPayload(CashDrawerShift $shift): CashDrawerShift
    {
        $shift->load(['shop', 'branch', 'user', 'opener', 'closer', 'movements']);
        $shift->setAttribute('cash_payment_total', $this->cashPaymentTotal($shift, $shift->closed_at ?: now()));

        return $shift;
    }

    private function shiftCode(): string
    {
        do {
            $code = 'SHIFT-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (CashDrawerShift::where('shift_code', $code)->exists());

        return $code;
    }
}
