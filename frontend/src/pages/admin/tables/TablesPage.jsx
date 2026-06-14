import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { alertError, toastSuccess } from "../../../components/ui";

const initial = { table_name: "", table_code: "", status: "active" };

export default function TablesPage() {
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tables, setTables] = useState([]);
  const [shopId, setShopId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      setShops(response.data.data.shops);
      setShopId(response.data.data.shops[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!shopId) return;
    api.get(`/shops/${shopId}/branches`).then((response) => {
      setBranches(response.data.data.branches);
      setBranchId(response.data.data.branches[0]?.id || "");
    });
  }, [shopId]);

  const load = useCallback(() => {
    if (!branchId) {
      setTables([]);
      return;
    }

    setLoading(true);
    setLoadError("");
    api
      .get(`/branches/${branchId}/tables`)
      .then((response) => setTables(response.data.data.tables))
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load tables."))
      .finally(() => setLoading(false));
  }, [branchId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/tables/${editing.id}`, form);
        toastSuccess("Table updated successfully.");
      } else {
        await api.post(`/branches/${branchId}/tables`, form);
        toastSuccess("Table created successfully.");
      }
      setForm(initial);
      setEditing(null);
      load();
    } catch (error) {
      alertError(error, "Please review the table.");
    }
  };

  const showQr = async (table) => {
    const response = await api.get(`/tables/${table.id}/qr`);
    setQr(response.data.data);
  };

  const remove = async (table) => {
    await api.delete(`/tables/${table.id}`);
    toastSuccess("Table deleted successfully.");
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit table" : "Add table"}</h2>
        <Select label="Shop" value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        <Select label="Branch" value={branchId} onChange={setBranchId} disabled={Boolean(editing)} options={branches.map((branch) => [branch.id, branch.name])} />
        <Input label="Table name" value={form.table_name} required onChange={(value) => setForm({ ...form, table_name: value })} />
        <Input label="Table code" value={form.table_code} required onChange={(value) => setForm({ ...form, table_code: value })} />
        <Select label="Status" value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        <button disabled={!branchId} className="mt-5 rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{editing ? "Update table" : "Create table"}</button>
      </form>
      <div className="grid gap-4">
        {qr ? (
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">QR preview</h2>
                <a className="break-all text-sm text-orange-700" href={qr.qr_url} target="_blank" rel="noreferrer">{qr.qr_url}</a>
              </div>
              <div className="flex gap-2">
                <a href={qr.qr_image_url} download className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Download</a>
                <button onClick={() => window.print()} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Print</button>
              </div>
            </div>
            <img className="mt-4 h-48 w-48 rounded-md border border-slate-200" src={qr.qr_image_url} alt="Table QR" />
          </div>
        ) : null}
        <DataTable
          columns={[
            { key: "table_name", label: "Name" },
            { key: "table_code", label: "Code" },
            { key: "qr_url", label: "URL", render: (row) => <span className="break-all text-xs">{row.qr_url}</span> },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={tables}
          loading={loading}
          error={loadError}
          emptyMessage="No tables yet."
          renderActions={(table) => (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setEditing(table); setForm({ ...initial, ...table }); }} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
              <button onClick={() => showQr(table)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">QR</button>
              <ConfirmButton onConfirm={() => remove(table)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton>
            </div>
          )}
        />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, required = false }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={value} required={required} onChange={(event) => onChange(event.target.value)} />
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
