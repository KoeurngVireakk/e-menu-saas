import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, MapPin, Plus, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppCard,
  AppEmptyState,
  AppPageHeader,
  AppStatusBadge,
  AppTable,
} from "../../../design-system/components";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import { Field, SelectInput, TextInput } from "../../../design-system/crud/FormControls";
import RowActionsMenu from "../../../design-system/crud/RowActionsMenu";
import StatusTabs from "../../../design-system/crud/StatusTabs";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = { name: "", phone: "", address: "", google_map_url: "", opening_time: "", closing_time: "", status: "active" };

export default function BranchesPage() {
  const { user } = useAuth();
  const allowCreate = canCreate(user, "branches");
  const allowUpdate = canUpdate(user, "branches");
  const allowDelete = canDelete(user, "branches");
  const queryClient = useQueryClient();
  const { data: shops = [] } = useShopsQuery();
  const [shopId, setShopId] = useState("");

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = setTimeout(() => setShopId(shops[0].id), 0);
      return () => clearTimeout(timer);
    }
  }, [shops, shopId]);

  const { data: branches = [], isLoading, isFetching, error: queryError } = useBranchesQuery(shopId);
  const loading = isLoading || isFetching;
  const loadError = queryError?.response?.data?.message || queryError?.message || "";

  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (shopId) {
      queryClient.invalidateQueries({ queryKey: ["branches", shopId] });
    }
  }, [queryClient, shopId]);

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return branches
      .filter((branch) => statusFilter === "all" || branch.status === statusFilter)
      .filter((branch) => !query || [branch.name, branch.phone, branch.address].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [branches, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({ ...initial, ...branch });
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
        await api.put(`/branches/${editing.id}`, form);
        toastSuccess("Branch updated successfully.");
      } else {
        await api.post(`/shops/${shopId}/branches`, form);
        toastSuccess("Branch created successfully.");
      }
      closeModal();
      load();
    } catch (error) {
      alertError(error, "Please review the branch.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (branch) => {
    await api.delete(`/branches/${branch.id}`);
    toastSuccess("Branch deleted successfully.");
    load();
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Branch",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.name}</p>
          <p className="text-xs text-slate-500">{row.original.opening_time || "Open"} - {row.original.closing_time || "Close"}</p>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || "Not set" },
    { accessorKey: "address", header: "Address", cell: ({ row }) => <span className="line-clamp-2">{row.original.address || "Not set"}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <AppStatusBadge value={row.original.status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="Operations"
        title="Branches"
        description="Manage restaurant locations from a focused list-first workspace. Branch details open in a centered form so the list remains scannable."
        primaryAction={allowCreate ? { children: "Add Branch", onClick: openCreate, iconLeft: <Plus className="h-4 w-4" /> } : null}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search branches..."
        filters={(
          <>
            <StatusTabs value={statusFilter} onChange={setStatusFilter} />
            <SelectFilter ariaLabel="Shop" value={shopId} onChange={setShopId} options={shops.map((shop) => [shop.id, shop.name])} />
          </>
        )}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      />

      <AppCard bodyClassName="p-0">
        {loadError ? (
          <AppEmptyState title="Branches could not load" description={loadError} actionLabel="Retry" onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredBranches}
            loading={loading}
            emptyTitle="No branches found"
            emptyDescription="Create a branch or clear filters to see more locations."
            emptyActionLabel={branches.length ? "Clear filters" : allowCreate ? "Create first branch" : undefined}
            onEmptyAction={branches.length ? () => {
              setSearch("");
              setStatusFilter("all");
            } : allowCreate ? openCreate : undefined}
            rowActions={(branch) => (
              <RowActionsMenu>
                {allowUpdate ? <IconAction label="Edit branch" icon={<Edit3 className="h-4 w-4" />} onClick={() => openEdit(branch)}>Edit</IconAction> : null}
                {branch.google_map_url ? <IconLink href={branch.google_map_url} label="Open map" icon={<MapPin className="h-4 w-4" />}>Map</IconLink> : null}
                {allowDelete ? (
                  <ConfirmButton
                    title="Delete branch?"
                    text={`This will delete ${branch.name}. Make sure no active operations depend on it.`}
                    onConfirm={() => remove(branch)}
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
        title={editing ? "Edit branch" : "Add branch"}
        description="Branch details are used for operations, kitchen filtering, reports, and table QR menus."
        onClose={closeModal}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create branch"}
        loading={saving}
        disabled={!shopId || (editing ? !allowUpdate : !allowCreate)}
        maxWidth="max-w-xl"
      >
        <Field label="Shop">
          <SelectInput value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        </Field>
        <Field label="Name">
          <TextInput value={form.name} required placeholder="Main Branch" onChange={(value) => setForm({ ...form, name: value })} />
        </Field>
        <Field label="Phone">
          <TextInput value={form.phone || ""} placeholder="+855..." onChange={(value) => setForm({ ...form, phone: value })} />
        </Field>
        <Field label="Address">
          <TextInput value={form.address || ""} placeholder="Street, city, landmark" onChange={(value) => setForm({ ...form, address: value })} />
        </Field>
        <Field label="Google map URL">
          <TextInput value={form.google_map_url || ""} placeholder="https://maps.google.com/..." onChange={(value) => setForm({ ...form, google_map_url: value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Opening">
            <TextInput type="time" value={form.opening_time || ""} onChange={(value) => setForm({ ...form, opening_time: value })} />
          </Field>
          <Field label="Closing">
            <TextInput type="time" value={form.closing_time || ""} onChange={(value) => setForm({ ...form, closing_time: value })} />
          </Field>
        </div>
        <Field label="Status">
          <SelectInput value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        </Field>
      </CrudFormModal>
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

function IconLink({ href, label, icon, children }) {
  return (
    <a
      aria-label={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {icon}
      {children}
    </a>
  );
}
