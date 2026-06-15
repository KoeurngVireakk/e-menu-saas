import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = { name: "", branch_id: "", sort_order: 0, status: "active", image: null };

export default function CategoriesPage() {
  const { user } = useAuth();
  const allowCreate = canCreate(user, "categories");
  const allowUpdate = canUpdate(user, "categories");
  const allowDelete = canDelete(user, "categories");
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shopId, setShopId] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      setShops(response.data.data.shops);
      setShopId(response.data.data.shops[0]?.id || "");
    });
  }, []);

  const load = useCallback(() => {
    if (!shopId) return;
    setLoading(true);
    setLoadError("");

    Promise.all([
      api.get(`/shops/${shopId}/categories`),
      api.get(`/shops/${shopId}/branches`),
    ])
      .then(([categoriesResponse, branchesResponse]) => {
        setCategories(categoriesResponse.data.data.categories);
        setBranches(branchesResponse.data.data.branches);
      })
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load categories."))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/categories/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Category updated successfully.");
      } else {
        await api.post(`/shops/${shopId}/categories`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Category created successfully.");
      }
      setForm(initial);
      setEditing(null);
      load();
    } catch (error) {
      alertError(error, "Please review the category.");
    }
  };

  const edit = (category) => {
    setEditing(category);
    setForm({ ...initial, ...category, branch_id: category.branch_id || "", image: null });
  };

  const remove = async (category) => {
    await api.delete(`/categories/${category.id}`);
    toastSuccess("Category deleted successfully.");
    load();
  };

  return (
    <div className={`grid gap-6 ${allowCreate || allowUpdate ? "lg:grid-cols-[360px_1fr]" : ""}`}>
      {allowCreate || allowUpdate ? <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit category" : "Add category"}</h2>
        <Select label="Shop" value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        <Input label="Name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} />
        <Select label="Branch" value={form.branch_id || ""} onChange={(value) => setForm({ ...form, branch_id: value })} options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
        <Input label="Sort order" type="number" value={form.sort_order || 0} onChange={(value) => setForm({ ...form, sort_order: value })} />
        <Select label="Status" value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Image
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="image/*" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} />
        </label>
        <button disabled={!shopId || (editing ? !allowUpdate : !allowCreate)} className="mt-5 rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{editing ? "Update category" : "Create category"}</button>
      </form> : null}
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All" },
          { key: "sort_order", label: "Sort" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={categories}
        loading={loading}
        error={loadError}
        emptyMessage="No categories yet."
        renderActions={allowUpdate || allowDelete ? (category) => (
          <div className="flex gap-2">
            {allowUpdate ? <button onClick={() => edit(category)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button> : null}
            {allowDelete ? <ConfirmButton onConfirm={() => remove(category)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton> : null}
          </div>
        ) : undefined}
      />
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      {label}
      <select disabled={disabled} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue || "empty"} value={optionValue}>{labelText}</option>)}
      </select>
    </label>
  );
}
