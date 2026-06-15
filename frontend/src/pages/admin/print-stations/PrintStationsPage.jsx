import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { Badge, Button, Card, EmptyState, alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { canManagePrintStations } from "../../../utils/permissions";

const initial = {
  branch_id: "",
  name: "",
  type: "kitchen",
  paper_size: "80mm",
  is_default: false,
  status: "active",
};

const stationTypes = [
  ["kitchen", "Kitchen"],
  ["cashier", "Cashier"],
  ["bar", "Bar"],
  ["receipt", "Receipt"],
];

const paperSizes = [
  ["58mm", "58mm"],
  ["80mm", "80mm"],
  ["a4", "A4"],
];

export default function PrintStationsPage() {
  const { user } = useAuth();
  const allowManage = canManagePrintStations(user);
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [branches, setBranches] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      const loaded = response.data.data.shops;
      setShops(loaded);
      setShopId(loaded[0]?.id || "");
    });
  }, []);

  const load = useCallback(() => {
    if (!shopId) {
      setBranches([]);
      setStations([]);
      return;
    }

    setLoading(true);
    setLoadError("");

    Promise.all([
      api.get(`/shops/${shopId}/branches`),
      api.get(`/shops/${shopId}/print-stations`),
    ])
      .then(([branchesResponse, stationsResponse]) => {
        setBranches(branchesResponse.data.data.branches);
        setStations(stationsResponse.data.data.print_stations);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load print stations.")))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      branch_id: form.branch_id || null,
      is_default: Boolean(form.is_default),
    };

    try {
      if (editing) {
        await api.put(`/print-stations/${editing.id}`, payload);
        toastSuccess("Print station updated.");
      } else {
        await api.post(`/shops/${shopId}/print-stations`, payload);
        toastSuccess("Print station created.");
      }
      resetForm();
      load();
    } catch (error) {
      alertError(error, "Please review the print station.");
    }
  };

  const edit = (station) => {
    setEditing(station);
    setForm({
      branch_id: station.branch_id || "",
      name: station.name || "",
      type: station.type || "kitchen",
      paper_size: station.paper_size || "80mm",
      is_default: Boolean(station.is_default),
      status: station.status || "active",
    });
  };

  const remove = async (station) => {
    await api.delete(`/print-stations/${station.id}`);
    toastSuccess("Print station deleted.");
    load();
  };

  const resetForm = () => {
    setEditing(null);
    setForm(initial);
  };

  if (!shops.length && !loading) {
    return <EmptyState title="No shops available." message="Create or assign a shop before configuring print stations." />;
  }

  return (
    <div className={`grid gap-6 ${allowManage ? "lg:grid-cols-[390px_1fr]" : ""}`}>
      {allowManage ? (
        <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
          <h1 className="text-lg font-semibold text-slate-950">{editing ? "Edit print station" : "Add print station"}</h1>
          <Select label="Shop" value={shopId} disabled={Boolean(editing)} onChange={(value) => setShopId(value)}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={form.branch_id} onChange={(value) => setForm({ ...form, branch_id: value })}>
            <option value="">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Input label="Station name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: value })}>
              {stationTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
            <Select label="Paper size" value={form.paper_size} onChange={(value) => setForm({ ...form, paper_size: value })}>
              {paperSizes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.is_default} onChange={(event) => setForm({ ...form, is_default: event.target.checked })} />
            Default station for this type
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" disabled={!shopId}>{editing ? "Update station" : "Create station"}</Button>
            {editing ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button> : null}
          </div>
        </form>
      ) : null}

      <Card className="grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Operations</p>
            <h2 className="text-xl font-bold text-slate-950">Print Stations</h2>
          </div>
          {!allowManage ? <Badge tone="slate">View only</Badge> : null}
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All branches" },
            { key: "type", label: "Type", render: (row) => <Badge tone={row.type === "kitchen" ? "orange" : "slate"}>{row.type}</Badge> },
            { key: "paper_size", label: "Paper" },
            { key: "is_default", label: "Default", render: (row) => row.is_default ? <Badge tone="green">Default</Badge> : "-" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={stations}
          loading={loading}
          error={loadError}
          emptyMessage="No print stations yet."
          renderActions={allowManage ? (station) => (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => edit(station)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
              <ConfirmButton onConfirm={() => remove(station)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</ConfirmButton>
            </div>
          ) : undefined}
        />
      </Card>
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

function Select({ label, value, onChange, disabled = false, children }) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      {label}
      <select disabled={disabled} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}
