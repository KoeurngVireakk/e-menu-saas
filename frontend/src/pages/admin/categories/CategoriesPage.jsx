import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Languages, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import {
  AppCard,
  AppEmptyState,
  AppPageHeader,
  AppStatusBadge,
  AppTable,
} from "../../../design-system/components";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import { Field, FileInput, SelectInput, TextInput } from "../../../design-system/crud/FormControls";
import RowActionsMenu from "../../../design-system/crud/RowActionsMenu";
import StatusTabs from "../../../design-system/crud/StatusTabs";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

const initial = { name: "", branch_id: "", sort_order: 0, status: "active", image: null };

export default function CategoriesPage() {
  const { user } = useAuth();
  const allowCreate = canCreate(user, "categories");
  const allowUpdate = canUpdate(user, "categories");
  const allowDelete = canDelete(user, "categories");
  const { data: shops = [] } = useShopsQuery();
  const [shopId, setShopId] = useState("");

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = setTimeout(() => setShopId(shops[0].id), 0);
      return () => clearTimeout(timer);
    }
  }, [shops, shopId]);

  const { data: branches = [] } = useBranchesQuery(shopId);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sort_order");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    if (!shopId) return;
    setLoading(true);
    setLoadError("");

    api.get(`/shops/${shopId}/categories`)
      .then((categoriesResponse) => {
        setCategories(categoriesResponse.data.data.categories);
      })
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load categories."))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .filter((category) => statusFilter === "all" || category.status === statusFilter)
      .filter((category) => !query || [category.name, category.branch?.name].filter(Boolean).join(" ").toLowerCase().includes(query))
      .sort((a, b) => {
        if (sortBy === "name") return String(a.name).localeCompare(String(b.name));
        if (sortBy === "status") return String(a.status).localeCompare(String(b.status));
        return Number(a.sort_order || 0) - Number(b.sort_order || 0);
      });
  }, [categories, search, sortBy, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ ...initial, ...category, branch_id: category.branch_id || "", image: null });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initial);
  };

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    setSaving(true);
    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/categories/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Category updated successfully.");
      } else {
        await api.post(`/shops/${shopId}/categories`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Category created successfully.");
      }
      closeModal();
      load();
    } catch (error) {
      alertError(error, "Please review the category.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    await api.delete(`/categories/${category.id}`);
    toastSuccess("Category deleted successfully.");
    load();
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.name}</p>
          <p className="text-xs text-slate-500">Sort order {row.original.sort_order ?? 0}</p>
        </div>
      ),
    },
    { accessorKey: "branch.name", header: "Branch", cell: ({ row }) => row.original.branch?.name || "All branches" },
    { accessorKey: "sort_order", header: "Sort" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <AppStatusBadge value={row.original.status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="Menu setup"
        title="Categories"
        description="Organize menu sections with a list-first workflow. Add or edit categories in a focused centered form while the list stays behind it."
        primaryAction={allowCreate ? { children: "Add Category", onClick: openCreate, iconLeft: <Plus className="h-4 w-4" /> } : null}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search categories..."
        filters={(
          <>
            <StatusTabs value={statusFilter} onChange={setStatusFilter} />
            <SelectFilter ariaLabel="Sort categories" value={sortBy} onChange={setSortBy} options={[["sort_order", "Sort order"], ["name", "Name"], ["status", "Status"]]} />
            <SelectFilter ariaLabel="Shop" value={shopId} onChange={setShopId} options={shops.map((shop) => [shop.id, shop.name])} />
          </>
        )}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
          setSortBy("sort_order");
        }}
      />

      <AppCard bodyClassName="p-0">
        {loadError ? (
          <AppEmptyState title="Categories could not load" description={loadError} actionLabel="Retry" onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredCategories}
            loading={loading}
            emptyTitle="No categories found"
            emptyDescription="Create a category or clear filters to see more menu sections."
            emptyActionLabel={categories.length ? "Clear filters" : allowCreate ? "Create first category" : undefined}
            onEmptyAction={categories.length ? () => {
              setSearch("");
              setStatusFilter("all");
              setSortBy("sort_order");
            } : allowCreate ? openCreate : undefined}
            rowActions={(category) => (
              <RowActionsMenu>
                {allowUpdate ? <IconAction label="Edit category" icon={<Edit3 className="h-4 w-4" />} onClick={() => openEdit(category)} /> : null}
                {allowUpdate ? <IconLink label="Manage translations" icon={<Languages className="h-4 w-4" />} to="/admin/translations" /> : null}
                {allowDelete ? (
                  <ConfirmButton
                    title="Delete category?"
                    text={`This will delete ${category.name}. Products assigned to it may need review.`}
                    onConfirm={() => remove(category)}
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
        title={editing ? "Edit category" : "Add category"}
        description="Keep category names short and easy for customers to scan on mobile menus."
        onClose={closeModal}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create category"}
        loading={saving}
        disabled={!shopId || (editing ? !allowUpdate : !allowCreate)}
        maxWidth="max-w-xl"
      >
        <Field label="Shop">
          <SelectInput value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
        </Field>
        <Field label="Name">
          <TextInput value={form.name} required placeholder="Coffee, Food, Desserts..." onChange={(value) => setForm({ ...form, name: value })} />
        </Field>
        <Field label="Branch">
          <SelectInput value={form.branch_id || ""} onChange={(value) => setForm({ ...form, branch_id: value })} options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
        </Field>
        <Field label="Sort order">
          <TextInput type="number" value={form.sort_order || 0} onChange={(value) => setForm({ ...form, sort_order: value })} />
        </Field>
        <Field label="Status">
          <SelectInput value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
        </Field>
        <Field label="Image">
          <FileInput onChange={(image) => setForm({ ...form, image })} />
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

function IconAction({ label, icon, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {icon}
      Edit
    </button>
  );
}

function IconLink({ label, icon, to }) {
  return (
    <Link
      aria-label={label}
      to={to}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {icon}
      Translate
    </Link>
  );
}
