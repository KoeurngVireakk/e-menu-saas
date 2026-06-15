<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawerShift;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Shop;
use App\Services\CashLedgerService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    public function __construct(private readonly CashLedgerService $ledger)
    {
    }

    public function index(Request $request)
    {
        abort_unless($request->user()->canViewExpenses(), 403);

        $filters = $this->filters($request);
        $expenses = $this->expenseQuery($request, $filters)
            ->with(['shop', 'branch', 'category', 'creator', 'approver'])
            ->latest('expense_date')
            ->latest()
            ->get();

        return $this->success('Expenses loaded', [
            'expenses' => $expenses,
            'summary' => [
                'total_amount' => $this->money($expenses->sum('amount')),
                'paid_total' => $this->money($expenses->where('status', 'paid')->sum('amount')),
                'pending_total' => $this->money($expenses->whereIn('status', ['draft', 'pending', 'approved'])->sum('amount')),
                'count' => $expenses->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->canManageExpenses(), 403);

        $validated = $this->validatedExpense($request, creating: true);
        $this->authorizeExpenseScope($request, (int) $validated['shop_id'], $validated['branch_id'] ?? null);

        if ($request->user()->role === 'cashier' && ! in_array($validated['status'] ?? 'pending', ['draft', 'pending'], true)) {
            return $this->error('Cashiers can only create draft or pending expenses.', status: 403);
        }

        $shop = Shop::findOrFail($validated['shop_id']);
        $expense = Expense::create($validated + [
            'created_by' => $request->user()->id,
            'expense_number' => $this->expenseNumber(),
            'currency_code' => $validated['currency_code'] ?? $shop->currency_code,
            'status' => $validated['status'] ?? 'pending',
            'expense_date' => $validated['expense_date'] ?? now()->toDateString(),
        ]);

        $this->audit($request, 'expense.created', $expense->shop_id, 'expense', $expense->id, [
            'expense_number' => $expense->expense_number,
            'branch_id' => $expense->branch_id,
            'amount' => $expense->amount,
            'currency_code' => $expense->currency_code,
            'status' => $expense->status,
        ]);

        return $this->success('Expense created', ['expense' => $expense->load(['shop', 'branch', 'category', 'creator'])], 201);
    }

    public function show(Request $request, Expense $expense)
    {
        $this->authorizeExpenseView($request, $expense);

        return $this->success('Expense loaded', [
            'expense' => $expense->load(['shop', 'branch', 'category', 'creator', 'approver']),
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorizeExpenseManage($request, $expense);
        abort_unless(in_array($expense->status, ['draft', 'pending', 'rejected'], true), 409);

        $validated = $this->validatedExpense($request, creating: false, expense: $expense);
        $this->authorizeExpenseScope($request, $expense->shop_id, $validated['branch_id'] ?? $expense->branch_id);

        if ($request->user()->role === 'cashier') {
            abort_unless((int) $expense->created_by === (int) $request->user()->id, 403);
            if (isset($validated['status']) && ! in_array($validated['status'], ['draft', 'pending'], true)) {
                return $this->error('Cashiers can only keep expenses in draft or pending.', status: 403);
            }
        }

        $expense->update($validated);

        $this->audit($request, 'expense.updated', $expense->shop_id, 'expense', $expense->id, [
            'expense_number' => $expense->expense_number,
            'status' => $expense->status,
            'amount' => $expense->amount,
        ]);

        return $this->success('Expense updated', ['expense' => $expense->fresh(['shop', 'branch', 'category', 'creator', 'approver'])]);
    }

    public function approve(Request $request, Expense $expense)
    {
        $this->authorizeExpenseApprove($request, $expense);
        abort_unless(in_array($expense->status, ['draft', 'pending', 'rejected'], true), 409);

        $expense->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $this->audit($request, 'expense.approved', $expense->shop_id, 'expense', $expense->id, [
            'expense_number' => $expense->expense_number,
            'amount' => $expense->amount,
        ]);

        return $this->success('Expense approved', ['expense' => $expense->fresh(['shop', 'branch', 'category', 'creator', 'approver'])]);
    }

    public function reject(Request $request, Expense $expense)
    {
        $this->authorizeExpenseApprove($request, $expense);
        abort_unless(in_array($expense->status, ['draft', 'pending', 'approved'], true), 409);

        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:500']]);
        $expense->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'note' => filled($validated['reason'] ?? null) ? trim(($expense->note ? $expense->note."\n" : '').'Rejected: '.$validated['reason']) : $expense->note,
        ]);

        $this->audit($request, 'expense.rejected', $expense->shop_id, 'expense', $expense->id, [
            'expense_number' => $expense->expense_number,
            'has_reason' => filled($validated['reason'] ?? null),
        ]);

        return $this->success('Expense rejected', ['expense' => $expense->fresh(['shop', 'branch', 'category', 'creator', 'approver'])]);
    }

    public function markPaid(Request $request, Expense $expense)
    {
        $this->authorizeExpensePayment($request, $expense);
        abort_unless(in_array($expense->status, ['pending', 'approved'], true), 409);

        $expense = DB::transaction(function () use ($request, $expense) {
            $shift = $expense->payment_method === 'cash' && $expense->branch_id
                ? CashDrawerShift::where('shop_id', $expense->shop_id)
                    ->where('branch_id', $expense->branch_id)
                    ->where('user_id', $request->user()->id)
                    ->where('status', 'open')
                    ->latest('opened_at')
                    ->first()
                : null;

            $expense->update([
                'status' => 'paid',
                'paid_at' => now(),
                'approved_by' => $expense->approved_by ?: ($request->user()->canApproveExpenses() ? $request->user()->id : null),
                'approved_at' => $expense->approved_at ?: ($request->user()->canApproveExpenses() ? now() : null),
            ]);

            $this->ledger->recordExpensePaid($expense->fresh(), $shift?->id, $request->user()->id);

            $this->audit($request, 'expense.paid', $expense->shop_id, 'expense', $expense->id, [
                'expense_number' => $expense->expense_number,
                'amount' => $expense->amount,
                'currency_code' => $expense->currency_code,
                'payment_method' => $expense->payment_method,
            ]);

            return $expense->fresh(['shop', 'branch', 'category', 'creator', 'approver']);
        });

        return $this->success('Expense marked paid', ['expense' => $expense]);
    }

    public function cancel(Request $request, Expense $expense)
    {
        $this->authorizeExpenseManage($request, $expense);
        abort_unless($expense->status !== 'paid', 409);

        $expense->update(['status' => 'cancelled']);

        $this->audit($request, 'expense.cancelled', $expense->shop_id, 'expense', $expense->id, [
            'expense_number' => $expense->expense_number,
        ]);

        return $this->success('Expense cancelled', ['expense' => $expense->fresh(['shop', 'branch', 'category', 'creator', 'approver'])]);
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'payment_method' => ['nullable', Rule::in(['cash', 'khqr_manual', 'bakong_khqr', 'bank_transfer', 'other'])],
            'status' => ['nullable', Rule::in(['draft', 'pending', 'approved', 'rejected', 'paid', 'cancelled'])],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $date = $validated['date'] ?? now()->toDateString();

        return [
            'shop_id' => $validated['shop_id'] ?? null,
            'shop_ids' => $shopIds,
            'branch_id' => isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            'has_branch_filter' => isset($validated['branch_id']),
            'date_from' => CarbonImmutable::parse($validated['date_from'] ?? $date)->startOfDay(),
            'date_to' => CarbonImmutable::parse($validated['date_to'] ?? $date)->endOfDay(),
            'payment_method' => $validated['payment_method'] ?? null,
            'status' => $validated['status'] ?? null,
        ];
    }

    private function expenseQuery(Request $request, array $filters): Builder
    {
        $expenses = Expense::whereIn('shop_id', $filters['shop_ids'])
            ->whereDate('expense_date', '>=', $filters['date_from']->toDateString())
            ->whereDate('expense_date', '<=', $filters['date_to']->toDateString())
            ->when($filters['has_branch_filter'], fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['payment_method'], fn ($query, $method) => $query->where('payment_method', $method))
            ->when($filters['status'], fn ($query, $status) => $query->where('status', $status));

        $expenses->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId, includeGlobal: true);
                });
            }
        });

        return $expenses;
    }

    private function validatedExpense(Request $request, bool $creating, ?Expense $expense = null): array
    {
        $shopId = $request->integer('shop_id') ?: $expense?->shop_id;

        return $request->validate([
            'shop_id' => [$creating ? 'required' : 'sometimes', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('shop_id', $shopId)],
            'expense_category_id' => ['nullable', 'integer', Rule::exists('expense_categories', 'id')->where('shop_id', $shopId)],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'amount' => [$creating ? 'required' : 'sometimes', 'numeric', 'min:0.01'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'payment_method' => [$creating ? 'required' : 'sometimes', Rule::in(['cash', 'khqr_manual', 'bakong_khqr', 'bank_transfer', 'other'])],
            'expense_date' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::in(['draft', 'pending'])],
        ]);
    }

    private function authorizeExpenseView(Request $request, Expense $expense): void
    {
        abort_unless($request->user()->canViewExpenses(), 403);
        abort_unless($request->user()->canAccessShop($expense->shop_id, $expense->branch_id), 403);
    }

    private function authorizeExpenseManage(Request $request, Expense $expense): void
    {
        $this->authorizeExpenseView($request, $expense);
        abort_unless($request->user()->canManageExpenses(), 403);
    }

    private function authorizeExpenseApprove(Request $request, Expense $expense): void
    {
        $this->authorizeExpenseView($request, $expense);
        abort_unless($request->user()->canApproveExpenses(), 403);
    }

    private function authorizeExpensePayment(Request $request, Expense $expense): void
    {
        $this->authorizeExpenseView($request, $expense);
        abort_unless($request->user()->canManageExpenses(), 403);
    }

    private function authorizeExpenseScope(Request $request, int $shopId, ?int $branchId = null): void
    {
        if ($branchId) {
            $branch = Branch::findOrFail($branchId);
            abort_unless((int) $branch->shop_id === $shopId, 422);
        }

        abort_unless($request->user()->canAccessShop($shopId, $branchId), 403);
    }

    private function expenseNumber(): string
    {
        do {
            $number = 'EXP-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Expense::where('expense_number', $number)->exists());

        return $number;
    }

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }
}
