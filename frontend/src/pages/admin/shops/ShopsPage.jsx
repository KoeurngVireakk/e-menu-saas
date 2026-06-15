import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = {
  name: "",
  phone: "",
  email: "",
  address: "",
  description: "",
  primary_color: "#f97316",
  secondary_color: "#111827",
  currency_code: "KHR",
  status: "active",
};

export default function ShopsPage() {
  const { user } = useAuth();
  const allowCreate = canCreate(user, "shops");
  const allowUpdate = canUpdate(user, "shops");
  const allowDelete = canDelete(user, "shops");
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");

    return api
      .get("/shops")
      .then((response) => setShops(response.data.data.shops))
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load shops."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => value !== null && data.append(key, value));

    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/shops/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Shop updated successfully.");
      } else {
        await api.post("/shops", data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Shop created successfully.");
      }
      setForm(initial);
      setEditing(null);
      load();
    } catch (error) {
      alertError(error, "Please review the shop profile.");
    }
  };

  const edit = (shop) => {
    setEditing(shop);
    setForm({ ...initial, ...shop, logo: null, cover: null });
  };

  const remove = async (shop) => {
    await api.delete(`/shops/${shop.id}`);
    toastSuccess("Shop deleted successfully.");
    load();
  };

  return (
    <div className={`grid gap-6 ${allowCreate || allowUpdate ? "lg:grid-cols-[420px_1fr]" : ""}`}>
      {allowCreate || allowUpdate ? <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit shop" : "Create shop"}</h2>
        <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Phone" value={form.phone || ""} onChange={(value) => setForm({ ...form, phone: value })} />
          <Input label="Email" type="email" value={form.email || ""} onChange={(value) => setForm({ ...form, email: value })} />
        </div>
        <Input label="Address" value={form.address || ""} onChange={(value) => setForm({ ...form, address: value })} />
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Description
          <textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Primary color" type="color" value={form.primary_color || "#f97316"} onChange={(value) => setForm({ ...form, primary_color: value })} />
          <Input label="Secondary color" type="color" value={form.secondary_color || "#111827"} onChange={(value) => setForm({ ...form, secondary_color: value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Currency" value={form.currency_code || "KHR"} onChange={(value) => setForm({ ...form, currency_code: value.toUpperCase() })} />
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Status
            <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.status || "active"} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <File label="Logo" onChange={(file) => setForm({ ...form, logo: file })} />
          <File label="Cover" onChange={(file) => setForm({ ...form, cover: file })} />
        </div>
        <button disabled={editing ? !allowUpdate : !allowCreate} className="mt-5 rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{editing ? "Update shop" : "Create shop"}</button>
        {editing ? <button type="button" onClick={() => { setEditing(null); setForm(initial); }} className="ml-2 rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button> : null}
      </form> : null}
      <div className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-950">Preview</h2>
          <div className="mt-4 rounded-md border border-slate-200 p-4" style={{ borderTop: `5px solid ${form.primary_color || "#f97316"}` }}>
            <p className="text-xl font-bold" style={{ color: form.secondary_color || "#111827" }}>{form.name || "Shop name"}</p>
            <p className="mt-1 text-sm text-slate-500">{form.description || "Shop description appears here."}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{form.currency_code || "KHR"}</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "currency_code", label: "Currency" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={shops}
          loading={loading}
          error={loadError}
          emptyMessage="No shops yet."
          renderActions={allowUpdate || allowDelete ? (shop) => (
            <div className="flex gap-2">
              {allowUpdate ? <button onClick={() => edit(shop)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button> : null}
              {allowDelete ? <ConfirmButton onConfirm={() => remove(shop)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton> : null}
            </div>
          ) : undefined}
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

function File({ label, onChange }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] || null)} />
    </label>
  );
}
