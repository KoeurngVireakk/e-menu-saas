import { Edit3, Plus, RefreshCw, Store, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { queryKeys } from "../../../lib/queryKeys";
import AppBadge from "../../../design-system/components/AppBadge";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppEmptyState from "../../../design-system/components/AppEmptyState";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import AppTable from "../../../design-system/components/AppTable";
import CreateEditDrawer from "../../../design-system/crud/CreateEditDrawer";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import { Field, FileInput, SelectInput, TextArea, TextInput } from "../../../design-system/crud/FormControls";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = {
  name: "",
  phone: "",
  email: "",
  address: "",
  description: "",
  primary_color: "#2563eb",
  secondary_color: "#0f172a",
  currency_code: "KHR",
  status: "active",
  logo: null,
  cover: null,
  logo_path: "",
  cover_path: "",
};

const editableFields = [
  "name",
  "phone",
  "email",
  "address",
  "description",
  "primary_color",
  "secondary_color",
  "currency_code",
  "status",
  "logo",
  "cover",
];

export default function ShopsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const allowCreate = canCreate(user, "shops");
  const allowUpdate = canUpdate(user, "shops");
  const allowDelete = canDelete(user, "shops");
  const { data: shops = [], isLoading: loading, error, refetch: load } = useShopsQuery();
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const loadError = error?.userMessage || error?.response?.data?.message || "";

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shops.filter((shop) => {
      const matchesStatus = statusFilter === "all" || shop.status === statusFilter;
      const matchesSearch = !query || [shop.name, shop.slug, shop.phone, shop.email, shop.currency_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [search, shops, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setDrawerOpen(true);
  };

  const openEdit = (shop) => {
    setEditing(shop);
    setForm({
      ...initial,
      name: shop.name || "",
      phone: shop.phone || "",
      email: shop.email || "",
      address: shop.address || "",
      description: shop.description || "",
      primary_color: shop.primary_color || "#2563eb",
      secondary_color: shop.secondary_color || "#0f172a",
      currency_code: shop.currency_code || "KHR",
      status: shop.status || "active",
      logo_path: shop.logo_path || "",
      cover_path: shop.cover_path || "",
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

    const data = new FormData();
    editableFields.forEach((key) => {
      const value = form[key];
      if (value !== null && value !== undefined && value !== "") {
        data.append(key, value);
      }
    });

    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/shops/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Shop updated successfully.");
      } else {
        await api.post("/shops", data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Shop created successfully.");
      }
      closeDrawer();
      await queryClient.invalidateQueries({ queryKey: queryKeys.shops });
    } catch (error) {
      alertError(error, "Please review the shop profile.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (shop) => {
    await api.delete(`/shops/${shop.id}`);
    toastSuccess("Shop deleted successfully.");
    await queryClient.invalidateQueries({ queryKey: queryKeys.shops });
  };

  const clearFilters = search || statusFilter !== "all"
    ? () => {
      setSearch("");
      setStatusFilter("all");
    }
    : undefined;

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Workspace setup"
        title="Shops"
        description="Manage restaurant identity, branding, currency, and the public profile customers see after scanning a QR code."
        primaryAction={allowCreate ? {
          children: "Add shop",
          iconLeft: <Plus className="h-4 w-4" aria-hidden="true" />,
          onClick: openCreate,
        } : null}
        secondaryActions={(
          <AppButton type="button" variant="secondary" iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />} onClick={load}>
            Refresh
          </AppButton>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <CrudToolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search shops..."
            filters={(
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
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
            ariaLabel="Shops"
            columns={[
              {
                accessorKey: "name",
                header: "Shop",
                cell: ({ row }) => (
                  <div className="flex min-w-56 items-center gap-3">
                    <BrandAvatar shop={row.original} />
                    <div>
                      <p className="font-black text-slate-950">{row.original.name}</p>
                      <p className="text-xs font-medium text-slate-500">{row.original.slug || "Public slug pending"}</p>
                    </div>
                  </div>
                ),
              },
              { accessorKey: "currency_code", header: "Currency" },
              {
                accessorKey: "contact",
                header: "Contact",
                cell: ({ row }) => (
                  <div className="min-w-44 text-sm">
                    <p className="font-semibold text-slate-700">{row.original.phone || "No phone"}</p>
                    <p className="text-xs text-slate-500">{row.original.email || "No email"}</p>
                  </div>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <AppBadge status={row.original.status === "active" ? "active" : row.original.status === "suspended" ? "warning" : "inactive"}>{row.original.status}</AppBadge>,
              },
            ]}
            data={filteredShops}
            loading={loading}
            emptyTitle={shops.length ? "No shops match your filters" : "Create your first shop"}
            emptyDescription={shops.length ? "Clear the search or status filter to see every shop again." : "A shop profile controls the restaurant name, branding, currency, and customer QR menu identity."}
            emptyActionLabel={allowCreate && !shops.length ? "Add shop" : undefined}
            onEmptyAction={allowCreate && !shops.length ? openCreate : undefined}
            rowActions={allowUpdate || allowDelete ? (shop) => (
              <div className="flex flex-wrap justify-end gap-2">
                {allowUpdate ? (
                  <AppButton type="button" variant="secondary" size="sm" iconLeft={<Edit3 className="h-4 w-4" aria-hidden="true" />} onClick={() => openEdit(shop)}>
                    Edit
                  </AppButton>
                ) : null}
                {allowDelete ? (
                  <ConfirmButton
                    title="Delete shop?"
                    text="This removes the shop profile and can affect customer QR menu access. This action cannot be undone."
                    onConfirm={() => remove(shop)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </ConfirmButton>
                ) : null}
              </div>
            ) : undefined}
          />
        </div>

        <BrandPreview form={form} selectedShop={editing || shops[0]} />
      </div>

      <CreateEditDrawer
        open={drawerOpen}
        title={editing ? "Edit shop" : "Add shop"}
        description={editing ? "Update customer-facing identity, branding, and shop contact details." : "Create the restaurant profile customers will see on the QR menu."}
        onClose={closeDrawer}
        onSubmit={submit}
        submitLabel={editing ? "Update shop" : "Create shop"}
        loading={saving}
        disabled={editing ? !allowUpdate : !allowCreate}
      >
        <Field label="Shop name" required description="Use the public restaurant name customers recognize.">
          <TextInput value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="MenuDIGI Cafe" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <TextInput value={form.phone || ""} onChange={(value) => setForm({ ...form, phone: value })} placeholder="+855..." />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={form.email || ""} onChange={(value) => setForm({ ...form, email: value })} placeholder="owner@example.com" />
          </Field>
        </div>
        <Field label="Address">
          <TextInput value={form.address || ""} onChange={(value) => setForm({ ...form, address: value })} placeholder="Street, district, city" />
        </Field>
        <Field label="Description" description="This short copy appears in brand previews and can guide customers before ordering.">
          <TextArea value={form.description || ""} onChange={(value) => setForm({ ...form, description: value })} placeholder="Fresh coffee, lunch, and table ordering." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary color">
            <TextInput type="color" value={form.primary_color || "#2563eb"} onChange={(value) => setForm({ ...form, primary_color: value })} />
          </Field>
          <Field label="Secondary color">
            <TextInput type="color" value={form.secondary_color || "#0f172a"} onChange={(value) => setForm({ ...form, secondary_color: value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency">
            <TextInput value={form.currency_code || "KHR"} onChange={(value) => setForm({ ...form, currency_code: value.toUpperCase() })} maxLength={3} />
          </Field>
          <Field label="Status">
            <SelectInput
              value={form.status || "active"}
              onChange={(value) => setForm({ ...form, status: value })}
              options={[
                ["active", "Active"],
                ["inactive", "Inactive"],
                ["suspended", "Suspended"],
              ]}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logo" description={form.logo?.name || (form.logo_path ? "Current logo is saved. Upload to replace it." : "Square image works best.")}>
            <FileInput onChange={(file) => setForm({ ...form, logo: file })} />
          </Field>
          <Field label="Cover" description={form.cover?.name || (form.cover_path ? "Current cover is saved. Upload to replace it." : "Wide image for menu headers.")}>
            <FileInput onChange={(file) => setForm({ ...form, cover: file })} />
          </Field>
        </div>
        <BrandPreview form={form} compact />
      </CreateEditDrawer>

      {!shops.length && !loading && !loadError && !allowCreate ? (
        <AppEmptyState
          icon={Store}
          title="No shops available"
          description="Ask an owner or administrator to create a shop profile before configuring menu operations."
        />
      ) : null}
    </div>
  );
}

function BrandAvatar({ shop }) {
  if (shop.logo_path) {
    return <img src={shop.logo_path} alt="" className="h-11 w-11 rounded-2xl border border-slate-200 object-cover" />;
  }

  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-2xl text-sm font-black text-white shadow-sm"
      style={{ backgroundColor: shop.primary_color || "#2563eb" }}
      aria-hidden="true"
    >
      {String(shop.name || "S").slice(0, 1).toUpperCase()}
    </div>
  );
}

function BrandPreview({ form, selectedShop, compact = false }) {
  const preview = {
    ...initial,
    ...(selectedShop || {}),
    ...form,
  };

  return (
    <AppCard
      title="Brand preview"
      description={compact ? "Customer-facing identity preview." : "Use this to check contrast, currency, and menu-facing identity before saving."}
      className="h-fit"
      bodyClassName="grid gap-4"
    >
      <div
        className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm"
        style={{ backgroundColor: preview.secondary_color || "#0f172a" }}
      >
        <div
          className="h-20 bg-slate-200"
          style={{
            backgroundColor: preview.primary_color || "#2563eb",
            backgroundImage: preview.cover_path ? `url(${preview.cover_path})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <BrandAvatar shop={preview} />
            <div className="min-w-0">
              <p className="truncate text-lg font-black">{preview.name || "Shop name"}</p>
              <p className="mt-1 text-sm text-white/75">{preview.description || "Shop description appears here."}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/15 px-3 py-1">{preview.currency_code || "KHR"}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{preview.status || "active"}</span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
