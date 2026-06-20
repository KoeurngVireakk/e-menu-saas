import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { Button, Card, ErrorState, Input, LoadingState, Select, StatCard, Textarea, alertError, confirmAction, toastSuccess } from "../../../components/ui";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import { useAuth } from "../../../context/AuthContext";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { formatCurrency } from "../../../utils/currency";
import { canApproveExpenses, canManageExpenses } from "../../../utils/permissions";

const initialExpense = {
  branch_id: "",
  expense_category_id: "",
  vendor_name: "",
  amount: "",
  currency_code: "",
  payment_method: "cash",
  expense_date: today(),
  note: "",
  status: "pending",
};

const initialCategory = { name: "", description: "", status: "active" };

export default function ExpensesPage() {
  const { user } = useAuth();
  const allowManage = canManageExpenses(user);
  const allowApprove = canApproveExpenses(user);
  const { data: shops = [] } = useShopsQuery();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", status: "", date: today() });
  const [expenseForm, setExpenseForm] = useState(initialExpense);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categoryForm, setCategoryForm] = useState(initialCategory);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { data: branches = [] } = useBranchesQuery(filters.shop_id);

  useEffect(() => {
    if (shops.length && !filters.shop_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, shop_id: shops[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [filters.shop_id, shops]);

  useEffect(() => {
    if (!filters.shop_id) return;

    api.get("/expense-categories", { params: { shop_id: filters.shop_id, status: "active" } })
      .then((categoriesResponse) => {
      setCategories(categoriesResponse.data.data.categories);
    });
  }, [filters.shop_id]);

  useEffect(() => {
    if (branches.length && user?.role === "cashier" && !filters.branch_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, branch_id: branches[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [branches, filters.branch_id, user?.role]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);
  const currency = selectedShop?.currency_code || "KHR";

  const load = useCallback(() => {
    if (!filters.shop_id || (user?.role === "cashier" && !filters.branch_id)) return;

    setLoading(true);
    setLoadError("");
    api.get("/expenses", { params: cleanParams(filters) })
      .then((response) => {
        setExpenses(response.data.data.expenses);
        setSummary(response.data.data.summary);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load expenses.")))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submitCategory = async () => {
    try {
      await api.post("/expense-categories", { ...categoryForm, shop_id: filters.shop_id });
      setCategoryForm(initialCategory);
      setCategoryModalOpen(false);
      const response = await api.get("/expense-categories", { params: { shop_id: filters.shop_id, status: "active" } });
      setCategories(response.data.data.categories);
      toastSuccess("Expense category saved.");
    } catch (error) {
      alertError(error, "Unable to save expense category.");
    }
  };

  const openExpense = (expense = null) => {
    setEditingExpense(expense || {});
    setExpenseForm(expense ? {
      branch_id: expense.branch_id || "",
      expense_category_id: expense.expense_category_id || "",
      vendor_name: expense.vendor_name || "",
      amount: expense.amount || "",
      currency_code: expense.currency_code || currency,
      payment_method: expense.payment_method || "cash",
      expense_date: expense.expense_date?.slice(0, 10) || today(),
      note: expense.note || "",
      status: ["draft", "pending"].includes(expense.status) ? expense.status : "pending",
    } : { ...initialExpense, currency_code: currency });
  };

  const submitExpense = async () => {
    try {
      const payload = {
        ...expenseForm,
        shop_id: filters.shop_id,
        branch_id: expenseForm.branch_id || null,
        expense_category_id: expenseForm.expense_category_id || null,
        currency_code: expenseForm.currency_code || currency,
      };

      if (editingExpense?.id) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
      } else {
        await api.post("/expenses", payload);
      }

      setEditingExpense(null);
      setExpenseForm(initialExpense);
      toastSuccess("Expense saved.");
      load();
    } catch (error) {
      alertError(error, "Unable to save expense.");
    }
  };

  const approveExpense = async (expense) => {
    await api.put(`/expenses/${expense.id}/approve`);
    toastSuccess("Expense approved.");
    load();
  };

  const rejectExpense = async (expense) => {
    if (!await confirmAction("Reject expense?", expense.expense_number)) return;
    await api.put(`/expenses/${expense.id}/reject`, { reason: "Rejected by admin" });
    toastSuccess("Expense rejected.");
    load();
  };

  const markPaid = async (expense) => {
    if (!await confirmAction("Mark expense paid?", expense.expense_number)) return;
    await api.put(`/expenses/${expense.id}/mark-paid`);
    toastSuccess("Expense marked paid.");
    load();
  };

  const cancelExpense = async (expense) => {
    if (!await confirmAction("Cancel expense?", expense.expense_number)) return;
    await api.put(`/expenses/${expense.id}/cancel`);
    toastSuccess("Expense cancelled.");
    load();
  };

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {user?.role !== "cashier" ? <option value="">All branches</option> : null}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All</option>
            {["draft", "pending", "approved", "rejected", "paid", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <Button type="button" onClick={load}>Refresh</Button>
          {allowManage ? <Button type="button" onClick={() => openExpense()}>Add expense</Button> : null}
        </div>
      </Card>

      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total expenses" value={formatCurrency(summary.total_amount, currency)} />
          <StatCard label="Paid expenses" value={formatCurrency(summary.paid_total, currency)} tone="green" />
          <StatCard label="Pending expenses" value={formatCurrency(summary.pending_total, currency)} tone="amber" />
        </div>
      ) : null}

      {allowApprove ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Expense Categories</h2>
            <p className="mt-1 text-sm text-slate-500">Create reusable accounting labels for expense records.</p>
          </div>
          <Button type="button" disabled={!filters.shop_id} onClick={() => setCategoryModalOpen(true)}>Add category</Button>
        </Card>
      ) : null}

      {loading ? <LoadingState message="Loading expenses..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      <DataTable
        columns={[
          { key: "expense_number", label: "Expense" },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All branches" },
          { key: "category", label: "Category", render: (row) => row.category?.name || "-" },
          { key: "vendor_name", label: "Vendor", render: (row) => row.vendor_name || "-" },
          { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount, row.currency_code) },
          { key: "payment_method", label: "Method" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={expenses}
        loading={loading}
        error={loadError}
        emptyMessage="No expenses yet."
        renderActions={(expense) => (
          <div className="flex flex-wrap gap-2">
            {allowManage && ["draft", "pending", "rejected"].includes(expense.status) ? <button type="button" onClick={() => openExpense(expense)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button> : null}
            {allowApprove && ["draft", "pending", "rejected"].includes(expense.status) ? <button type="button" onClick={() => approveExpense(expense)} className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white">Approve</button> : null}
            {allowApprove && ["draft", "pending", "approved"].includes(expense.status) ? <button type="button" onClick={() => rejectExpense(expense)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Reject</button> : null}
            {allowManage && ["pending", "approved"].includes(expense.status) ? <button type="button" onClick={() => markPaid(expense)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">Mark paid</button> : null}
            {allowManage && expense.status !== "paid" && expense.status !== "cancelled" ? <button type="button" onClick={() => cancelExpense(expense)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Cancel</button> : null}
          </div>
        )}
      />

      <CrudFormModal
        open={categoryModalOpen}
        title="Add expense category"
        description="Create a reusable category for this shop's expense records."
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryForm(initialCategory);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          submitCategory();
        }}
        submitLabel="Add category"
        disabled={!filters.shop_id || !categoryForm.name}
      >
        <Input label="Name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} />
        <Input label="Description" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} />
        <Select label="Status" value={categoryForm.status} onChange={(event) => setCategoryForm({ ...categoryForm, status: event.target.value })}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </CrudFormModal>

      <CrudFormModal
        open={Boolean(editingExpense)}
        title={editingExpense?.id ? "Edit Expense" : "Add Expense"}
        description="Record the vendor, amount, payment method, and accounting date."
        onClose={() => setEditingExpense(null)}
        onSubmit={(event) => {
          event.preventDefault();
          submitExpense();
        }}
        submitLabel="Save expense"
        disabled={!allowManage}
        maxWidth="max-w-3xl"
      >
          <Select label="Branch" value={expenseForm.branch_id} onChange={(event) => setExpenseForm({ ...expenseForm, branch_id: event.target.value })}>
            <option value="">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label="Category" value={expenseForm.expense_category_id} onChange={(event) => setExpenseForm({ ...expenseForm, expense_category_id: event.target.value })}>
            <option value="">Uncategorized</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
          <Input label="Vendor" value={expenseForm.vendor_name} onChange={(event) => setExpenseForm({ ...expenseForm, vendor_name: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Amount" type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
            <Input label="Currency" value={expenseForm.currency_code} onChange={(event) => setExpenseForm({ ...expenseForm, currency_code: event.target.value.toUpperCase() })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Select label="Payment method" value={expenseForm.payment_method} onChange={(event) => setExpenseForm({ ...expenseForm, payment_method: event.target.value })}>
              {["cash", "khqr_manual", "bakong_khqr", "bank_transfer", "other"].map((method) => <option key={method} value={method}>{method}</option>)}
            </Select>
            <Input label="Expense date" type="date" value={expenseForm.expense_date} onChange={(event) => setExpenseForm({ ...expenseForm, expense_date: event.target.value })} />
          </div>
          <Select label="Status" value={expenseForm.status} onChange={(event) => setExpenseForm({ ...expenseForm, status: event.target.value })}>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </Select>
          <Textarea label="Note" rows={3} value={expenseForm.note} onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })} />
      </CrudFormModal>
    </div>
  );
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
