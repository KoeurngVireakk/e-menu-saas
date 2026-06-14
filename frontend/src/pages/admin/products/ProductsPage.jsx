import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { alertError, toastError, toastSuccess } from "../../../components/ui";

const initial = {
  name: "",
  branch_id: "",
  category_id: "",
  description: "",
  price: "",
  discount_price: "",
  preparation_time_minutes: "",
  is_featured: false,
  is_available: true,
  status: "active",
  image: null,
  options_json: "",
};

export default function ProductsPage() {
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopId, setShopId] = useState("");
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
      api.get(`/shops/${shopId}/products`),
      api.get(`/shops/${shopId}/categories`),
      api.get(`/shops/${shopId}/branches`),
    ])
      .then(([productsResponse, categoriesResponse, branchesResponse]) => {
        setProducts(productsResponse.data.data.products);
        setCategories(categoriesResponse.data.data.categories);
        setBranches(branchesResponse.data.data.branches);
      })
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load products."))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    const payload = { ...form, is_featured: form.is_featured ? 1 : 0, is_available: form.is_available ? 1 : 0 };
    delete payload.options_json;
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    if (form.options_json.trim()) {
      try {
        JSON.parse(form.options_json).forEach((option, optionIndex) => {
          data.append(`options[${optionIndex}][name]`, option.name);
          data.append(`options[${optionIndex}][type]`, option.type || "single");
          data.append(`options[${optionIndex}][is_required]`, option.is_required ? 1 : 0);
          (option.values || []).forEach((value, valueIndex) => {
            data.append(`options[${optionIndex}][values][${valueIndex}][name]`, value.name);
            data.append(`options[${optionIndex}][values][${valueIndex}][extra_price]`, value.extra_price || 0);
          });
        });
      } catch {
        toastError("Options must be valid JSON.");
        return;
      }
    }

    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/products/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Product updated successfully.");
      } else {
        await api.post(`/shops/${shopId}/products`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Product created successfully.");
      }
      setForm(initial);
      setEditing(null);
      load();
    } catch (error) {
      alertError(error, "Please review the product.");
    }
  };

  const edit = (product) => {
    setEditing(product);
    setForm({
      ...initial,
      ...product,
      branch_id: product.branch_id || "",
      image: null,
      options_json: product.options?.length ? JSON.stringify(product.options, null, 2) : "",
    });
  };

  const remove = async (product) => {
    await api.delete(`/products/${product.id}`);
    toastSuccess("Product deleted successfully.");
    load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit product" : "Add product"}</h2>
        <Select label="Shop" value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        <Input label="Name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} />
        <Select label="Category" value={form.category_id || ""} onChange={(value) => setForm({ ...form, category_id: value })} options={[["", "Select category"], ...categories.map((category) => [category.id, category.name])]} />
        <Select label="Branch" value={form.branch_id || ""} onChange={(value) => setForm({ ...form, branch_id: value })} options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Description
          <textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Price" type="number" value={form.price} required onChange={(value) => setForm({ ...form, price: value })} />
          <Input label="Discount" type="number" value={form.discount_price || ""} onChange={(value) => setForm({ ...form, discount_price: value })} />
        </div>
        <Input label="Prep minutes" type="number" value={form.preparation_time_minutes || ""} onChange={(value) => setForm({ ...form, preparation_time_minutes: value })} />
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-slate-700">
          <label><input type="checkbox" checked={Boolean(form.is_available)} onChange={(event) => setForm({ ...form, is_available: event.target.checked })} /> Available</label>
          <label><input type="checkbox" checked={Boolean(form.is_featured)} onChange={(event) => setForm({ ...form, is_featured: event.target.checked })} /> Featured</label>
        </div>
        <Select label="Status" value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Image
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="image/*" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Options JSON
          <textarea className="mt-1 h-24 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs" value={form.options_json} onChange={(event) => setForm({ ...form, options_json: event.target.value })} placeholder='[{"name":"Size","type":"single","values":[{"name":"Large","extra_price":2000}]}]' />
        </label>
        <button disabled={!shopId} className="mt-5 rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{editing ? "Update product" : "Create product"}</button>
      </form>
      <div className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-950">Product detail preview</h2>
          <div className="mt-3 rounded-md border border-slate-200 p-4">
            <p className="font-bold text-slate-950">{form.name || "Product name"}</p>
            <p className="mt-1 text-sm text-slate-500">{form.description || "Product description"}</p>
            <p className="mt-2 font-semibold text-orange-700">{Number(form.discount_price || form.price || 0).toLocaleString()} KHR</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "category", label: "Category", render: (row) => row.category?.name },
            { key: "price", label: "Price", render: (row) => Number(row.discount_price || row.price).toLocaleString() },
            { key: "is_available", label: "Available", render: (row) => row.is_available ? "Yes" : "No" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={products}
          loading={loading}
          error={loadError}
          emptyMessage="No products yet."
          renderActions={(product) => (
            <div className="flex gap-2">
              <button onClick={() => edit(product)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
              <ConfirmButton onConfirm={() => remove(product)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton>
            </div>
          )}
        />
      </div>
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
      <select disabled={disabled} required={label === "Category"} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue || "empty"} value={optionValue}>{labelText}</option>)}
      </select>
    </label>
  );
}
