<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->canViewExpenses(), 403);

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $categories = ExpenseCategory::with('shop')
            ->whereIn('shop_id', $shopIds)
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderBy('name')
            ->get();

        return $this->success('Expense categories loaded', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->canApproveExpenses(), 403);

        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'name' => ['required', 'string', 'max:255', Rule::unique('expense_categories')->where('shop_id', $request->integer('shop_id'))],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        abort_unless($request->user()->canAccessShop((int) $validated['shop_id']), 403);

        $category = ExpenseCategory::create($validated + ['status' => $validated['status'] ?? 'active']);

        $this->audit($request, 'expense_category.created', $category->shop_id, 'expense_category', $category->id, [
            'name' => $category->name,
            'status' => $category->status,
        ]);

        return $this->success('Expense category created', ['category' => $category->load('shop')], 201);
    }

    public function update(Request $request, ExpenseCategory $category)
    {
        abort_unless($request->user()->canApproveExpenses(), 403);
        abort_unless($request->user()->canAccessShop($category->shop_id), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('expense_categories')->where('shop_id', $category->shop_id)->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $category->update($validated);

        $this->audit($request, 'expense_category.updated', $category->shop_id, 'expense_category', $category->id, [
            'name' => $category->name,
            'status' => $category->status,
        ]);

        return $this->success('Expense category updated', ['category' => $category->fresh('shop')]);
    }

    public function destroy(Request $request, ExpenseCategory $category)
    {
        abort_unless($request->user()->canApproveExpenses(), 403);
        abort_unless($request->user()->canAccessShop($category->shop_id), 403);

        $category->update(['status' => 'inactive']);

        $this->audit($request, 'expense_category.deleted', $category->shop_id, 'expense_category', $category->id, [
            'name' => $category->name,
        ]);

        return $this->success('Expense category archived', ['category' => $category->fresh('shop')]);
    }
}
