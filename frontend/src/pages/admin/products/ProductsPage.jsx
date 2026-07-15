import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Edit3, Eye, Grid2X2, Languages, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import ConfirmButton from "../../../components/ConfirmButton";
import { alertError, toastError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopCategories, useShopProducts } from "../../../hooks/useApiQueries";
import { queryKeys } from "../../../lib/queryKeys";
import useLanguage from "../../../i18n/useLanguage";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppEmptyState,
  AppPageHeader,
  AppStatusBadge,
  AppTable,
} from "../../../design-system/components";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import DataViewToggle from "../../../design-system/crud/DataViewToggle";
import { Field, FileInput, SelectInput, TextArea, TextInput, ToggleField } from "../../../design-system/crud/FormControls";
import RowActionsMenu from "../../../design-system/crud/RowActionsMenu";
import StatusTabs from "../../../design-system/crud/StatusTabs";
import { canCreate, canDelete, canUpdate } from "../../../utils/permissions";

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

const drawerTabs = [
  ["basic", "Basic Info"],
  ["pricing", "Pricing"],
  ["options", "Options/Add-ons"],
  ["availability", "Availability"],
  ["translations", "Translations"],
];

const optionsExample = JSON.stringify([
  {
    name: "Size",
    type: "single",
    is_required: true,
    values: [
      { name: "Regular", extra_price: 0 },
      { name: "Large", extra_price: 2000 },
    ],
  },
], null, 2);

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowCreate = canCreate(user, "products");
  const allowUpdate = canUpdate(user, "products");
  const allowDelete = canDelete(user, "products");
  const { data: shops = [] } = useShopsQuery();
  const [shopId, setShopId] = useState("");

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = setTimeout(() => setShopId(shops[0].id), 0);
      return () => clearTimeout(timer);
    }
  }, [shops, shopId]);

  const { data: branches = [] } = useBranchesQuery(shopId);
  const categoriesQuery = useShopCategories(shopId);
  const productsQuery = useShopProducts(shopId);
  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const loading = categoriesQuery.isLoading || productsQuery.isLoading;
  const load = async () => Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("basic");
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const loadError = categoriesQuery.error?.userMessage || productsQuery.error?.userMessage
    || categoriesQuery.error?.response?.data?.message || productsQuery.error?.response?.data?.message || "";
  const [optionsError, setOptionsError] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((product) => statusFilter === "all" || product.status === statusFilter)
      .filter((product) => categoryFilter === "all" || String(product.category_id) === String(categoryFilter))
      .filter((product) => branchFilter === "all" || String(product.branch_id || "") === String(branchFilter))
      .filter((product) => {
        if (availabilityFilter === "all") return true;
        return availabilityFilter === "available" ? product.is_available : !product.is_available;
      })
      .filter((product) => !query || [product.name, product.description, product.category?.name].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [availabilityFilter, branchFilter, categoryFilter, products, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initial);
    setDrawerTab("basic");
    setOptionsError("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...initial,
      ...product,
      branch_id: product.branch_id || "",
      image: null,
      options_json: product.options?.length ? JSON.stringify(product.options, null, 2) : "",
    });
    setDrawerTab("basic");
    setOptionsError("");
    setModalOpen(true);
  };

  const duplicate = (product) => {
    setEditing(null);
    setForm({
      ...initial,
      ...product,
      name: `${product.name} Copy`,
      branch_id: product.branch_id || "",
      image: null,
      options_json: product.options?.length ? JSON.stringify(product.options, null, 2) : "",
    });
    setDrawerTab("basic");
    setOptionsError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initial);
    setOptionsError("");
  };

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
        parseOptionsJson(form.options_json).forEach((option, optionIndex) => {
          data.append(`options[${optionIndex}][name]`, option.name);
          data.append(`options[${optionIndex}][type]`, option.type || "single");
          data.append(`options[${optionIndex}][is_required]`, option.is_required ? 1 : 0);
          (option.values || []).forEach((value, valueIndex) => {
            data.append(`options[${optionIndex}][values][${valueIndex}][name]`, value.name);
            data.append(`options[${optionIndex}][values][${valueIndex}][extra_price]`, value.extra_price || 0);
          });
        });
      } catch (error) {
        setOptionsError(error.message);
        toastError(error.message);
        setDrawerTab("options");
        return;
      }
    }

    setOptionsError("");

    setSaving(true);
    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/products/${editing.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Product updated successfully.");
      } else {
        await api.post(`/shops/${shopId}/products`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toastSuccess("Product created successfully.");
      }
      closeModal();
      await queryClient.invalidateQueries({ queryKey: queryKeys.shopProducts(shopId) });
    } catch (error) {
      alertError(error, "Please review the product.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    await api.delete(`/products/${product.id}`);
    toastSuccess("Product deleted successfully.");
    await queryClient.invalidateQueries({ queryKey: queryKeys.shopProducts(shopId) });
  };

  const copyOptionsExample = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(optionsExample);
      toastSuccess(t("productOptions.copySuccess", "Option example copied."));
    } catch {
      toastError(t("productOptions.copyUnavailable", "Copy is unavailable in this browser. Select the example text instead."));
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => <ProductIdentity product={row.original} />,
    },
    { accessorKey: "category.name", header: "Category", cell: ({ row }) => row.original.category?.name || "Unassigned" },
    { accessorKey: "price", header: "Price", cell: ({ row }) => <Price product={row.original} /> },
    { accessorKey: "is_available", header: "Availability", cell: ({ row }) => <AppBadge status={row.original.is_available ? "success" : "warning"}>{row.original.is_available ? "Available" : "Unavailable"}</AppBadge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <AppStatusBadge value={row.original.status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="Menu catalog"
        title={t("pageTitles.productsTitle")}
        description={t("pageTitles.productsSubtitle")}
        primaryAction={allowCreate ? { children: t("pageTitles.productsCta"), onClick: openCreate, iconLeft: <Plus className="h-4 w-4" /> } : null}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search products..."
        filters={(
          <>
            <StatusTabs value={statusFilter} onChange={setStatusFilter} />
            <SelectFilter ariaLabel="Category" value={categoryFilter} onChange={setCategoryFilter} options={[["all", "All categories"], ...categories.map((category) => [category.id, category.name])]} />
            <SelectFilter ariaLabel="Branch" value={branchFilter} onChange={setBranchFilter} options={[["all", "All branches"], ["", "Shared"], ...branches.map((branch) => [branch.id, branch.name])]} />
            <SelectFilter ariaLabel="Availability" value={availabilityFilter} onChange={setAvailabilityFilter} options={[["all", "All availability"], ["available", "Available"], ["unavailable", "Unavailable"]]} />
            <SelectFilter ariaLabel="Shop" value={shopId} onChange={setShopId} options={shops.map((shop) => [shop.id, shop.name])} />
          </>
        )}
        extraActions={<DataViewToggle value={view} onChange={setView} />}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
          setCategoryFilter("all");
          setBranchFilter("all");
          setAvailabilityFilter("all");
        }}
      />

      {loadError ? (
        <AppEmptyState title="Products could not load" description={loadError} actionLabel="Retry" onAction={load} />
      ) : view === "grid" ? (
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          allowCreate={allowCreate}
          allowUpdate={allowUpdate}
          allowDelete={allowDelete}
          onEdit={openEdit}
          onDuplicate={duplicate}
          onDelete={remove}
          onCreate={openCreate}
        />
      ) : (
        <AppCard bodyClassName="p-0">
          <AppTable
            columns={columns}
            data={filteredProducts}
            loading={loading}
            emptyTitle="No products found"
            emptyDescription="Create a product or clear filters to see more menu items."
            emptyActionLabel={products.length ? "Clear filters" : allowCreate ? "Create first product" : undefined}
            onEmptyAction={products.length ? () => {
              setSearch("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setBranchFilter("all");
              setAvailabilityFilter("all");
            } : allowCreate ? openCreate : undefined}
            ariaLabel="Products"
            rowActions={(product) => <ProductActions product={product} allowUpdate={allowUpdate} allowDelete={allowDelete} onEdit={openEdit} onDuplicate={duplicate} onDelete={remove} />}
          />
        </AppCard>
      )}

      <CrudFormModal
        open={modalOpen}
        title={editing ? t("crudForms.editProduct") : t("crudForms.addProduct")}
        description={t("crudForms.productHelper")}
        onClose={closeModal}
        onSubmit={submit}
        submitLabel={editing ? t("common.save") : t("crudForms.createProduct")}
        loading={saving}
        disabled={!shopId || (editing ? !allowUpdate : !allowCreate)}
        maxWidth="max-w-3xl"
      >
        <div className="-mx-1 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {drawerTabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDrawerTab(value)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-black transition ${drawerTab === value ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {drawerTab === "basic" ? (
          <>
            <Field label="Shop">
              <SelectInput value={shopId} onChange={setShopId} disabled={Boolean(editing)} options={shops.map((shop) => [shop.id, shop.name])} />
            </Field>
            <Field label="Name">
              <TextInput value={form.name} required placeholder="Iced Latte" onChange={(value) => setForm({ ...form, name: value })} />
            </Field>
            <Field label="Category">
              <SelectInput value={form.category_id || ""} required onChange={(value) => setForm({ ...form, category_id: value })} options={[["", "Select category"], ...categories.map((category) => [category.id, category.name])]} />
            </Field>
            <Field label="Description">
              <TextArea value={form.description || ""} placeholder="Short customer-facing description" onChange={(value) => setForm({ ...form, description: value })} />
            </Field>
            <Field label="Image">
              <FileInput onChange={(image) => setForm({ ...form, image })} />
            </Field>
          </>
        ) : null}

        {drawerTab === "pricing" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Price">
                <TextInput type="number" value={form.price} required onChange={(value) => setForm({ ...form, price: value })} />
              </Field>
              <Field label="Discount price">
                <TextInput type="number" value={form.discount_price || ""} onChange={(value) => setForm({ ...form, discount_price: value })} />
              </Field>
            </div>
            <Field label="Preparation time">
              <TextInput type="number" value={form.preparation_time_minutes || ""} placeholder="Minutes" onChange={(value) => setForm({ ...form, preparation_time_minutes: value })} />
            </Field>
            <AppCard title="Price preview" bodyClassName="p-4">
              <Price product={form} />
            </AppCard>
          </>
        ) : null}

        {drawerTab === "options" ? (
          <>
            <AppCard title={t("productOptions.guidanceTitle", "Option builder guidance")} description={t("productOptions.guidanceDescription", "Keep the existing JSON shape so product submissions stay compatible with the backend. Use one object per option group.")}>
              <div className="grid gap-2 text-sm leading-6 text-slate-600">
                <p><strong className="text-slate-900">type:</strong> {t("productOptions.typeHelp", "use single for radio-style choice or multiple for add-ons.")}</p>
                <p><strong className="text-slate-900">is_required:</strong> {t("productOptions.requiredHelp", "set to true when customers must choose before adding to cart.")}</p>
                <p><strong className="text-slate-900">extra_price:</strong> {t("productOptions.priceHelp", "use KHR amount, or 0 for free options.")}</p>
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                    <span className="text-xs font-black uppercase text-slate-300">{t("productOptions.exampleLabel", "Backend-compatible example")}</span>
                    <AppButton type="button" size="sm" variant="secondary" iconLeft={<Copy className="h-4 w-4" />} onClick={copyOptionsExample}>
                      {t("productOptions.copyExample", "Copy example")}
                    </AppButton>
                  </div>
                  <pre className="max-h-64 overflow-auto p-3 text-left text-xs leading-5 text-slate-100"><code>{optionsExample}</code></pre>
                </div>
              </div>
            </AppCard>
            <Field
              label={t("productOptions.fieldLabel", "Options JSON")}
              description={t("productOptions.fieldDescription", "Paste a JSON array using the structure above. Existing product option payloads remain unchanged.")}
              error={optionsError}
            >
              <TextArea
                rows={10}
                value={form.options_json}
                className="font-mono text-xs"
                onChange={(value) => {
                  setForm({ ...form, options_json: value });
                  if (optionsError) setOptionsError("");
                }}
                placeholder={optionsExample}
              />
            </Field>
          </>
        ) : null}

        {drawerTab === "availability" ? (
          <>
            <Field label="Branch">
              <SelectInput value={form.branch_id || ""} onChange={(value) => setForm({ ...form, branch_id: value })} options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
            </Field>
            <ToggleField label="Available" description="Customers can add this product to cart." checked={Boolean(form.is_available)} onChange={(value) => setForm({ ...form, is_available: value })} />
            <ToggleField label="Featured" description="Highlight this item in menu experiences." checked={Boolean(form.is_featured)} onChange={(value) => setForm({ ...form, is_featured: value })} />
            <Field label="Status">
              <SelectInput value={form.status || "active"} onChange={(value) => setForm({ ...form, status: value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />
            </Field>
          </>
        ) : null}

        {drawerTab === "translations" ? (
          <AppCard title="Translations" description="Use the dedicated translations workspace for Khmer and English product text.">
            <AppButton as={Link} to="/admin/translations" variant="outline" iconLeft={<Languages className="h-4 w-4" />}>
              Manage translations
            </AppButton>
          </AppCard>
        ) : null}
      </CrudFormModal>
    </div>
  );
}

function ProductGrid({ products, loading, allowCreate, allowUpdate, allowDelete, onEdit, onDuplicate, onDelete, onCreate }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100" />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <AppEmptyState
        icon={Grid2X2}
        title="No products found"
        description="Create a product or clear filters to see more menu items."
        actionLabel={allowCreate ? "Create first product" : undefined}
        onAction={allowCreate ? onCreate : undefined}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <AppCard key={product.id} className="transition hover:-translate-y-0.5 hover:shadow-md" bodyClassName="p-4">
          <ProductImage product={product} className="h-40 w-full rounded-xl" />
          <div className="mt-4 flex items-start justify-between gap-3">
            <ProductIdentity product={product} compact />
            <AppStatusBadge value={product.status} />
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{product.description || "No description added."}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Price product={product} />
            <div className="flex gap-1">
              {product.is_featured ? <AppBadge status="info">Featured</AppBadge> : null}
              <AppBadge status={product.is_available ? "success" : "warning"}>{product.is_available ? "Available" : "Unavailable"}</AppBadge>
            </div>
          </div>
          <div className="mt-4">
            <ProductActions product={product} allowUpdate={allowUpdate} allowDelete={allowDelete} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </AppCard>
      ))}
    </div>
  );
}

function ProductIdentity({ product, compact = false }) {
  return (
    <div className="flex items-center gap-3">
      {!compact ? <ProductImage product={product} className="h-12 w-12 rounded-xl" /> : null}
      <div className="min-w-0">
        <p className="truncate font-black text-slate-950">{product.name}</p>
        <p className="truncate text-xs text-slate-500">{product.category?.name || "Unassigned"} · {product.branch?.name || "All branches"}</p>
      </div>
    </div>
  );
}

function ProductImage({ product, className }) {
  const src = product.image_url || product.image || product.photo_url;
  if (src) return <img src={src} alt={product.name} className={`${className} object-cover`} />;
  return (
    <div className={`${className} grid place-items-center bg-slate-100 text-slate-400`}>
      <Grid2X2 className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

function Price({ product }) {
  const price = Number(product.price || 0);
  const discount = Number(product.discount_price || 0);
  return (
    <div>
      <p className="text-sm font-black text-slate-950">{Number(discount || price).toLocaleString()} KHR</p>
      {discount ? <p className="text-xs font-semibold text-slate-400 line-through">{price.toLocaleString()} KHR</p> : null}
    </div>
  );
}

function ProductActions({ product, allowUpdate, allowDelete, onEdit, onDuplicate, onDelete }) {
  return (
    <RowActionsMenu>
      <IconButton label="View details" icon={<Eye className="h-4 w-4" />} onClick={() => onEdit(product)}>View</IconButton>
      {allowUpdate ? <IconButton label="Edit product" icon={<Edit3 className="h-4 w-4" />} onClick={() => onEdit(product)}>Edit</IconButton> : null}
      {allowUpdate ? <IconButton label="Duplicate product" icon={<Copy className="h-4 w-4" />} onClick={() => onDuplicate(product)}>Duplicate</IconButton> : null}
      {allowUpdate ? <IconLink label="Manage translations" icon={<Languages className="h-4 w-4" />} to="/admin/translations">Translate</IconLink> : null}
      {allowDelete ? (
        <ConfirmButton
          title="Delete product?"
          text={`This will delete ${product.name}. Existing historical orders remain unchanged.`}
          onConfirm={() => onDelete(product)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </ConfirmButton>
      ) : null}
    </RowActionsMenu>
  );
}

function SelectFilter({ ariaLabel, value, onChange, options }) {
  return <SelectInput aria-label={ariaLabel} value={value} onChange={onChange} options={options} className="w-auto min-w-36" />;
}

function parseOptionsJson(value) {
  let parsed;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Options must use valid JSON syntax.");
  }

  if (!Array.isArray(parsed)) throw new Error("Options must be a JSON array.");

  parsed.forEach((option, index) => {
    if (!option || typeof option !== "object" || !String(option.name || "").trim()) {
      throw new Error(`Option group ${index + 1} needs a name.`);
    }
    if (option.type && !["single", "multiple"].includes(option.type)) {
      throw new Error(`Option group ${index + 1} type must be single or multiple.`);
    }
    if (!Array.isArray(option.values) || !option.values.length) {
      throw new Error(`Option group ${index + 1} needs at least one value.`);
    }
    option.values.forEach((optionValue, valueIndex) => {
      if (!optionValue || !String(optionValue.name || "").trim()) {
        throw new Error(`Value ${valueIndex + 1} in option group ${index + 1} needs a name.`);
      }
    });
  });

  return parsed;
}

function IconButton({ label, icon, onClick, children }) {
  return <AppButton type="button" variant="secondary" size="sm" aria-label={label} iconLeft={icon} onClick={onClick}>{children}</AppButton>;
}

function IconLink({ label, icon, to, children }) {
  return <AppButton as={Link} to={to} variant="secondary" size="sm" aria-label={label} iconLeft={icon}>{children}</AppButton>;
}
