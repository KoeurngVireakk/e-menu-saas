import { Edit3, Plus, Printer, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import AppBadge from "../../../design-system/components/AppBadge";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppEmptyState from "../../../design-system/components/AppEmptyState";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import AppTable from "../../../design-system/components/AppTable";
import CreateEditDrawer from "../../../design-system/crud/CreateEditDrawer";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import { Field, SelectInput, TextInput, ToggleField } from "../../../design-system/crud/FormControls";
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
  const { data: shops = [], isLoading: shopsLoading } = useShopsQuery();
  const [shopId, setShopId] = useState("");
  const { data: branches = [] } = useBranchesQuery(shopId);

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = window.setTimeout(() => setShopId(shops[0].id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [shopId, shops]);

  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    if (!shopId) {
      setStations([]);
      return Promise.resolve();
    }

    setLoading(true);
    setLoadError("");

    return api.get(`/shops/${shopId}/print-stations`)
      .then((stationsResponse) => {
        setStations(stationsResponse.data.data.print_stations);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load print stations.")))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stations.filter((station) => {
      const matchesType = typeFilter === "all" || station.type === typeFilter;
      const matchesSearch = !query || [station.name, station.type, station.paper_size, station.branch?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  }, [search, stations, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setDrawerOpen(true);
  };

  const openEdit = (station) => {
    setEditing(station);
    setForm({
      branch_id: station.branch_id || "",
      name: station.name || "",
      type: station.type || "kitchen",
      paper_size: station.paper_size || "80mm",
      is_default: Boolean(station.is_default),
      status: station.status || "active",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setForm(initial);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

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
      closeDrawer();
      load();
    } catch (error) {
      alertError(error, "Please review the print station.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (station) => {
    await api.delete(`/print-stations/${station.id}`);
    toastSuccess("Print station deleted.");
    load();
  };

  const clearFilters = search || typeFilter !== "all"
    ? () => {
      setSearch("");
      setTypeFilter("all");
    }
    : undefined;

  if (!shops.length && !loading && !shopsLoading) {
    return (
      <AppEmptyState
        icon={Printer}
        title="No shops available"
        description="Create or assign a shop before configuring kitchen, cashier, receipt, or bar print stations."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Operations"
        title="Print stations"
        description="Route kitchen tickets, receipts, and service-area print jobs to the right branch device."
        primaryAction={allowManage ? {
          children: "Add station",
          iconLeft: <Plus className="h-4 w-4" aria-hidden="true" />,
          onClick: openCreate,
          disabled: !shopId,
        } : null}
        secondaryActions={(
          <AppButton type="button" variant="secondary" iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />} onClick={load} disabled={!shopId}>
            Refresh
          </AppButton>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <CrudToolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search print stations..."
            filters={(
              <>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Shop
                  <select
                    value={shopId}
                    onChange={(event) => setShopId(event.target.value)}
                    disabled={Boolean(editing)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Type
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All types</option>
                    {stationTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </>
            )}
            onClear={clearFilters}
          />

          {loadError ? (
            <AppCard className="border-rose-200 bg-rose-50" bodyClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-rose-700">{loadError}</p>
              <AppButton type="button" variant="secondary" size="sm" onClick={load}>Try again</AppButton>
            </AppCard>
          ) : null}

          <AppTable
            ariaLabel="Print stations"
            columns={[
              {
                accessorKey: "name",
                header: "Station",
                cell: ({ row }) => (
                  <div className="min-w-44">
                    <p className="font-black text-slate-950">{row.original.name}</p>
                    <p className="text-xs font-medium text-slate-500">{row.original.branch?.name || "All branches"}</p>
                  </div>
                ),
              },
              {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => <AppBadge status={row.original.type === "kitchen" ? "warning" : "info"}>{row.original.type}</AppBadge>,
              },
              { accessorKey: "paper_size", header: "Paper" },
              {
                accessorKey: "is_default",
                header: "Default",
                cell: ({ row }) => row.original.is_default ? <AppBadge status="success">Default</AppBadge> : <span className="text-slate-400">-</span>,
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <AppBadge status={row.original.status === "active" ? "active" : "inactive"}>{row.original.status}</AppBadge>,
              },
            ]}
            data={filteredStations}
            loading={loading}
            emptyTitle={stations.length ? "No print stations match your filters" : "Add your first print station"}
            emptyDescription={stations.length ? "Clear filters to review all configured station routes." : "Print stations tell the operations team where kitchen tickets, receipts, and bar items should be sent."}
            emptyActionLabel={allowManage && !stations.length ? "Add station" : undefined}
            onEmptyAction={allowManage && !stations.length ? openCreate : undefined}
            rowActions={allowManage ? (station) => (
              <div className="flex flex-wrap justify-end gap-2">
                <AppButton type="button" variant="secondary" size="sm" iconLeft={<Edit3 className="h-4 w-4" aria-hidden="true" />} onClick={() => openEdit(station)}>
                  Edit
                </AppButton>
                <ConfirmButton
                  title="Delete print station?"
                  text="This removes the station route for future tickets. Existing print logs are not changed."
                  onConfirm={() => remove(station)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </ConfirmButton>
              </div>
            ) : undefined}
          />
        </div>

        <AppCard
          title="Station routing"
          description="Keep one default route per print type so staff can print with fewer choices during service."
          className="h-fit"
        >
          <div className="grid gap-3 text-sm">
            {stationTypes.map(([value, label]) => {
              const count = stations.filter((station) => station.type === value).length;
              const defaultStation = stations.find((station) => station.type === value && station.is_default);

              return (
                <div key={value} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-900">{label}</p>
                    <AppBadge status={count ? "info" : "inactive"}>{count}</AppBadge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{defaultStation ? `Default: ${defaultStation.name}` : "No default station selected."}</p>
                </div>
              );
            })}
          </div>
        </AppCard>
      </div>

      <CreateEditDrawer
        open={drawerOpen}
        title={editing ? "Edit print station" : "Add print station"}
        description="Configure where operational tickets and receipts should be routed."
        onClose={closeDrawer}
        onSubmit={submit}
        submitLabel={editing ? "Update station" : "Create station"}
        loading={saving}
        disabled={!shopId || !allowManage}
      >
        <Field label="Shop" required description="Stations belong to one shop workspace.">
          <SelectInput
            value={shopId}
            disabled={Boolean(editing)}
            onChange={setShopId}
            options={shops.map((shop) => [shop.id, shop.name])}
          />
        </Field>
        <Field label="Branch" description="Leave as all branches when one printer handles the full shop.">
          <SelectInput
            value={form.branch_id}
            onChange={(value) => setForm({ ...form, branch_id: value })}
            options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]}
          />
        </Field>
        <Field label="Station name" required description="Use a clear operational name, such as Kitchen pass or Cashier receipt.">
          <TextInput value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Kitchen pass" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <SelectInput value={form.type} onChange={(value) => setForm({ ...form, type: value })} options={stationTypes} />
          </Field>
          <Field label="Paper size">
            <SelectInput value={form.paper_size} onChange={(value) => setForm({ ...form, paper_size: value })} options={paperSizes} />
          </Field>
        </div>
        <Field label="Status">
          <SelectInput
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={[
              ["active", "Active"],
              ["inactive", "Inactive"],
            ]}
          />
        </Field>
        <ToggleField
          label="Default station for this type"
          description="Use this when staff should not have to choose a printer for the same ticket type."
          checked={Boolean(form.is_default)}
          onChange={(value) => setForm({ ...form, is_default: value })}
        />
      </CreateEditDrawer>
    </div>
  );
}
