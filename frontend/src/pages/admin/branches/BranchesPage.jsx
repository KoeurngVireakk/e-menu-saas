import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";

const initial = { name: "", phone: "", address: "", google_map_url: "", opening_time: "", closing_time: "", status: "active" };

export default function BranchesPage() {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get("/shops").then((response) => {
      setShops(response.data.data.shops);
      setShopId(response.data.data.shops[0]?.id || "");
    });
  }, []);

  const load = () => {
    if (shopId) api.get(`/shops/${shopId}/branches`).then((response) => setBranches(response.data.data.branches));
  };

  useEffect(() => {
    load();
  }, [shopId]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/branches/${editing.id}`, form);
        Swal.fire("Saved", "Branch updated successfully.", "success");
      } else {
        await api.post(`/shops/${shopId}/branches`, form);
        Swal.fire("Created", "Branch created successfully.", "success");
      }
      setForm(initial);
      setEditing(null);
      load();
    } catch (error) {
      Swal.fire("Save failed", error.response?.data?.message || "Please review the branch.", "error");
    }
  };

  const edit = (branch) => {
    setEditing(branch);
    setForm({ ...initial, ...branch });
  };

  const remove = async (branch) => {
    await api.delete(`/branches/${branch.id}`);
    Swal.fire("Deleted", "Branch deleted successfully.", "success");
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit branch" : "Add branch"}</h2>
        <ShopSelect shops={shops} value={shopId} onChange={setShopId} disabled={Boolean(editing)} />
        <Input label="Name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} />
        <Input label="Phone" value={form.phone || ""} onChange={(value) => setForm({ ...form, phone: value })} />
        <Input label="Address" value={form.address || ""} onChange={(value) => setForm({ ...form, address: value })} />
        <Input label="Google map URL" value={form.google_map_url || ""} onChange={(value) => setForm({ ...form, google_map_url: value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Opening" type="time" value={form.opening_time || ""} onChange={(value) => setForm({ ...form, opening_time: value })} />
          <Input label="Closing" type="time" value={form.closing_time || ""} onChange={(value) => setForm({ ...form, closing_time: value })} />
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Status
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.status || "active"} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button disabled={!shopId} className="mt-5 rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{editing ? "Update branch" : "Create branch"}</button>
        {editing ? <button type="button" onClick={() => { setEditing(null); setForm(initial); }} className="ml-2 rounded-md border border-slate-300 px-4 py-2 font-semibold">Cancel</button> : null}
      </form>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={branches}
        renderActions={(branch) => (
          <div className="flex gap-2">
            <button onClick={() => edit(branch)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
            <ConfirmButton onConfirm={() => remove(branch)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton>
          </div>
        )}
      />
    </div>
  );
}

function ShopSelect({ shops, value, onChange, disabled }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      Shop
      <select disabled={disabled} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
      </select>
    </label>
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
