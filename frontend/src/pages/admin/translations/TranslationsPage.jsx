import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Select, Textarea, alertError, toastSuccess } from "../../../components/ui";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import { supportedLocales } from "../../../utils/localization";
import { useShopsQuery } from "../../../hooks/useShopsQuery";

const entityConfig = {
  shop: { endpoint: (id) => `/shops/${id}/translations`, title: "Shop translations", fields: ["name", "description", "address"] },
  category: { endpoint: (id) => `/categories/${id}/translations`, title: "Category translations", fields: ["name"] },
  product: { endpoint: (id) => `/products/${id}/translations`, title: "Product translations", fields: ["name", "description"] },
  option: { endpoint: (id) => `/product-options/${id}/translations`, title: "Option translations", fields: ["name"] },
  value: { endpoint: (id) => `/product-option-values/${id}/translations`, title: "Option value translations", fields: ["name"] },
};

export default function TranslationsPage() {
  const { data: shops = [], isLoading: shopsLoading, error: shopsError } = useShopsQuery();
  const [shopId, setShopId] = useState("");
  const [data, setData] = useState(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = window.setTimeout(() => setShopId(shops[0].id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [shopId, shops]);

  const load = useCallback(() => {
    if (!shopId) {
      return Promise.resolve();
    }

    setTranslationsLoading(true);
    setError("");

    return api
      .get(`/shops/${shopId}/translations`)
      .then((response) => setData(response.data.data))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load translations.")))
      .finally(() => setTranslationsLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openEditor = (type, entity) => {
    const config = entityConfig[type];
    setEditor({
      type,
      entity,
      title: config.title,
      fields: config.fields,
      form: buildForm(entity, config.fields),
    });
  };

  const saveEditor = async (event) => {
    event.preventDefault();
    if (!editor) return;

    setSaving(true);

    try {
      await api.put(entityConfig[editor.type].endpoint(editor.entity.id), {
        translations: editor.form,
      });
      await toastSuccess("Translations saved.");
      setEditor(null);
      load();
    } catch (requestError) {
      alertError(requestError, "Please review the translations.");
    } finally {
      setSaving(false);
    }
  };

  const loading = shopsLoading || translationsLoading;
  const visibleError = error || (shopsError ? getApiErrorMessage(shopsError, "Unable to load shops.") : "");

  if (loading && !data) {
    return <LoadingState message="Loading translations..." />;
  }

  if (visibleError && !data) {
    return <ErrorState message={visibleError} onRetry={load} />;
  }

  return (
    <div className="grid gap-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Localization</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Menu translations</h1>
            <p className="mt-1 text-sm text-slate-500">Manage Khmer and English public menu text with base-field fallback.</p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-64 sm:flex-row sm:items-end">
            <Select label="Shop" value={shopId} onChange={(event) => setShopId(event.target.value)} options={shops.map((shop) => [shop.id, shop.name])} />
            <Button type="button" variant="secondary" onClick={load} disabled={!shopId || loading}>Refresh</Button>
          </div>
        </div>
      </Card>

      {!shops.length ? <EmptyState title="No shops available" message="Create a shop before adding translations." /> : null}

      {data?.shop ? (
        <Card className="p-4">
          <EntityHeader type="Shop" entity={data.shop} onEdit={() => openEditor("shop", data.shop)} />
          <p className="mt-2 text-sm text-slate-500">{data.shop.description || "No description"}</p>
        </Card>
      ) : null}

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Catalog</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Categories and products</h2>
        </div>
        {(data?.categories || []).map((category) => (
          <Card key={category.id} className="p-4">
            <EntityHeader type="Category" entity={category} onEdit={() => openEditor("category", category)} />
            <div className="mt-4 grid gap-3">
              {(category.products || []).map((product) => (
                <div key={product.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <EntityHeader type="Product" entity={product} compact onEdit={() => openEditor("product", product)} />
                  <p className="mt-1 text-sm text-slate-500">{product.description || "No description"}</p>
                  <div className="mt-3 grid gap-2">
                    {(product.options || []).map((option) => (
                      <div key={option.id} className="rounded-md bg-white p-3">
                        <EntityHeader type="Option" entity={option} compact onEdit={() => openEditor("option", option)} />
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(option.values || []).map((value) => (
                            <button
                              key={value.id}
                              type="button"
                              onClick={() => openEditor("value", value)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
                            >
                              {value.name} <MissingBadges entity={value} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!category.products?.length ? <EmptyState title="No products" message="This category has no products to translate." /> : null}
            </div>
          </Card>
        ))}
        {data && !data.categories?.length ? <EmptyState title="No categories" message="Add categories and products before managing menu translations." /> : null}
      </section>

      <TranslationModal editor={editor} saving={saving} onClose={() => setEditor(null)} onChange={setEditor} onSave={saveEditor} />
    </div>
  );
}

function EntityHeader({ type, entity, onEdit, compact = false }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{type}</p>
        <h3 className={`${compact ? "text-base" : "text-lg"} truncate font-bold text-slate-950`}>{entity.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <MissingBadges entity={entity} />
        </div>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={onEdit}>Edit</Button>
    </div>
  );
}

function MissingBadges({ entity }) {
  const missing = supportedLocales
    .filter((locale) => !translationFor(entity, locale.code)?.name)
    .map((locale) => locale.code.toUpperCase());

  if (!missing.length) {
    return <Badge tone="green">Complete</Badge>;
  }

  return missing.map((locale) => <Badge key={locale} tone="amber">Missing {locale}</Badge>);
}

function TranslationModal({ editor, saving, onClose, onChange, onSave }) {
  if (!editor) return null;

  const update = (locale, field, value) => {
    onChange({
      ...editor,
      form: {
        ...editor.form,
        [locale]: {
          ...editor.form[locale],
          [field]: value,
        },
      },
    });
  };

  return (
    <CrudFormModal
      open
      title={editor.title}
      description="Add customer-facing English and Khmer text without changing the base catalog name."
      onClose={onClose}
      onSubmit={onSave}
      submitLabel="Save translations"
      loading={saving}
      maxWidth="max-w-3xl"
    >
        <div className="rounded-md bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-950">Base text</p>
          <p className="mt-1 text-slate-600">{editor.entity.name}</p>
        </div>
        {supportedLocales.map((locale) => (
          <div key={locale.code} className="grid gap-3 rounded-md border border-slate-200 p-3">
            <p className="font-semibold text-slate-950">{locale.label}</p>
            {editor.fields.includes("name") ? (
              <Input
                label="Name"
                required
                value={editor.form[locale.code]?.name || ""}
                onChange={(event) => update(locale.code, "name", event.target.value)}
              />
            ) : null}
            {editor.fields.includes("description") ? (
              <Textarea
                label="Description"
                rows={3}
                value={editor.form[locale.code]?.description || ""}
                onChange={(event) => update(locale.code, "description", event.target.value)}
              />
            ) : null}
            {editor.fields.includes("address") ? (
              <Textarea
                label="Address"
                rows={2}
                value={editor.form[locale.code]?.address || ""}
                onChange={(event) => update(locale.code, "address", event.target.value)}
              />
            ) : null}
          </div>
        ))}
    </CrudFormModal>
  );
}

function buildForm(entity, fields) {
  return Object.fromEntries(supportedLocales.map((locale) => {
    const translation = translationFor(entity, locale.code);

    return [
      locale.code,
      Object.fromEntries(fields.map((field) => [field, translation?.[field] ?? ""])),
    ];
  }));
}

function translationFor(entity, locale) {
  return (entity.translations || []).find((translation) => translation.locale === locale);
}
