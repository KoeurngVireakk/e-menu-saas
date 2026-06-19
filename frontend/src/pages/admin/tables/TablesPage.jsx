import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Edit3, Plus, Printer, QrCode, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import useLanguage from "../../../i18n/useLanguage";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppPageHeader,
  AppSheet,
  AppStatusBadge,
  AppTable,
} from "../../../design-system/components";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import { Field, SelectInput, TextInput } from "../../../design-system/crud/FormControls";
import RowActionsMenu from "../../../design-system/crud/RowActionsMenu";
import StatusTabs from "../../../design-system/crud/StatusTabs";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = { table_name: "", table_code: "", status: "active" };

export default function TablesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowCreate = canCreate(user, "tables");
  const allowUpdate = canUpdate(user, "tables");
  const allowDelete = canDelete(user, "tables");
  const { data: shops = [] } = useShopsQuery();
  const [tables, setTables] = useState([]);
  const [shopId, setShopId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qr, setQr] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { data: branches = [] } = useBranchesQuery(shopId);

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = window.setTimeout(() => setShopId(shops[0].id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [shopId, shops]);

  useEffect(() => {
    if (branches.length || branchId) {
      const timer = window.setTimeout(() => {
        if (branches.length && !branches.some((branch) => String(branch.id) === String(branchId))) {
          setBranchId(branches[0].id);
        } else if (!branches.length && branchId) {
          setBranchId("");
        }
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [branchId, branches]);

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

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tables
      .filter((table) => statusFilter === "all" || table.status === statusFilter)
      .filter((table) => !query || [table.table_name, table.table_code, table.qr_url].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [search, statusFilter, tables]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEdit = (table) => {
    setEditing(table);
    setForm({ ...initial, ...table });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initial);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tables/${editing.id}`, form);
        toastSuccess("Table updated successfully.");
      } else {
        await api.post(`/branches/${branchId}/tables`, form);
        toastSuccess("Table created successfully.");
      }
      closeModal();
      load();
    } catch (error) {
      alertError(error, "Please review the table.");
    } finally {
      setSaving(false);
    }
  };

  const showQr = async (table) => {
    const response = await api.get(`/tables/${table.id}/qr`);
    setQr({ ...response.data.data, table });
    setQrOpen(true);
  };

  const remove = async (table) => {
    await api.delete(`/tables/${table.id}`);
    toastSuccess("Table deleted successfully.");
    load();
  };

  const columns = [
    {
      accessorKey: "table_name",
      header: "Table",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.table_name}</p>
          <p className="text-xs text-slate-500">{row.original.table_code}</p>
        </div>
      ),
    },
    { accessorKey: "qr_url", header: "Menu link", cell: ({ row }) => <span className="line-clamp-1 max-w-md text-xs text-slate-500">{row.original.qr_url}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <AppStatusBadge value={row.original.status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="QR operations"
        title={t("pageTitles.tablesTitle")}
        description={t("pageTitles.tablesSubtitle")}
        primaryAction={allowCreate ? { children: t("pageTitles.tablesCta"), onClick: openCreate, iconLeft: <Plus className="h-4 w-4" /> } : null}
        secondaryActions={<AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Bulk print</AppButton>}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search tables..."
        filters={(
          <>
            <StatusTabs value={statusFilter} onChange={setStatusFilter} />
            <SelectFilter ariaLabel="Shop" value={shopId} onChange={setShopId} options={shops.map((shop) => [shop.id, shop.name])} />
            <SelectFilter ariaLabel="Branch" value={branchId} onChange={setBranchId} options={branches.map((branch) => [branch.id, branch.name])} />
          </>
        )}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      />

      <AppCard bodyClassName="p-0">
        {loadError ? (
          <AppEmptyState title="Tables could not load" description={loadError} actionLabel="Retry" onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredTables}
            loading={loading}
            emptyTitle="No tables found"
            emptyDescription="Create a table to generate a QR menu link for guests."
            emptyActionLabel={allowCreate ? "Create first table" : undefined}
            onEmptyAction={allowCreate ? openCreate : undefined}
            rowActions={(table) => (
              <RowActionsMenu>
                {allowUpdate ? <IconAction label="Edit table" icon={<Edit3 className="h-4 w-4" />} onClick={() => openEdit(table)}>Edit</IconAction> : null}
                <IconAction label="Preview QR" icon={<QrCode className="h-4 w-4" />} onClick={() => showQr(table)}>QR</IconAction>
                {allowDelete ? (
                  <ConfirmButton
                    title="Delete table?"
                    text={`This will delete ${table.table_name} and its QR reference.`}
                    onConfirm={() => remove(table)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </ConfirmButton>
                ) : null}
              </RowActionsMenu>
            )}
          />
        )}
      </AppCard>

      <CrudFormModal
        open={modalOpen}
        title={editing ? t("crudForms.editTable") : t("crudForms.addTable")}
        description={t("crudForms.tableHelper")}
        onClose={closeModal}
        onSubmit={submit}
        submitLabel={editing ? t("common.save") : t("common.create")}
        loading={saving}
        disabled={!branchId || (editing ? !allowUpdate : !allowCreate)}
        maxWidth="max-w-2xl"
      >
        <Field label="Shop">
          <SelectInput value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        </Field>
        <Field label="Branch">
          <SelectInput value={branchId} onChange={setBranchId} disabled={Boolean(editing)} options={branches.map((branch) => [branch.id, branch.name])} />
        </Field>
        <Field label="Table name">
          <TextInput value={form.table_name} required placeholder="Table 01" onChange={(value) => setForm({ ...form, table_name: value })} />
        </Field>
        <Field label="Table code">
          <TextInput value={form.table_code} required placeholder="T01" onChange={(value) => setForm({ ...form, table_code: value })} />
        </Field>
        <Field label="Status">
          <SelectInput value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        </Field>
      </CrudFormModal>

      <AppSheet open={qrOpen} title="Table QR preview" onClose={() => setQrOpen(false)}>
        {qr ? (
          <div className="grid gap-5">
            <AppCard title={qr.table?.table_name || "Table"} description="Print this QR for guests or download it for a table tent.">
              <div className="grid place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <img className="h-56 w-56 rounded-xl border border-slate-200 bg-white" src={qr.qr_image_url} alt={`${qr.table?.table_name || "Table"} QR code`} />
              </div>
              <a className="mt-4 block break-all text-sm font-semibold text-blue-700" href={qr.qr_url} target="_blank" rel="noreferrer">{qr.qr_url}</a>
            </AppCard>
            <div className="flex flex-wrap gap-2">
              <AppButton as="a" href={qr.qr_image_url} download variant="outline" iconLeft={<Download className="h-4 w-4" />}>Download PNG</AppButton>
              <AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print QR</AppButton>
              <ConfirmButton
                title="Regenerate QR?"
                text="Regeneration is a future placeholder. Current QR links remain stable."
                onConfirm={() => toastSuccess("QR regeneration is prepared for a future module.")}
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Regenerate
              </ConfirmButton>
            </div>
          </div>
        ) : null}
      </AppSheet>
    </div>
  );
}

function SelectFilter({ ariaLabel, value, onChange, options }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
    >
      {options.map(([optionValue, label]) => <option key={optionValue || "empty"} value={optionValue}>{label}</option>)}
    </select>
  );
}

function IconAction({ label, icon, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {icon}
      {children}
    </button>
  );
}
