import { Bell, CreditCard, Palette, Save, ShieldCheck, Store } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import { ErrorState, Input, LoadingState, Select, Textarea, alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import AppBadge from "../../../design-system/components/AppBadge";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import useLanguage from "../../../i18n/useLanguage";
import { canManageTenantSettings } from "../../../utils/permissions";

const initial = {
  name: "",
  phone: "",
  email: "",
  address: "",
  description: "",
  primary_color: "#f97316",
  secondary_color: "#111827",
  currency_code: "KHR",
  base_currency: "KHR",
  display_secondary_currency: false,
  secondary_currency: "USD",
  exchange_rate: 4100,
  order_auto_accept: false,
  service_charge_percentage: 0,
  tax_percentage: 0,
  default_discount_percentage: 0,
  receipt_footer_text: "",
  invoice_prefix: "INV",
  receipt_prefix: "RCPT",
  telegram_enabled: false,
  telegram_chat_id: "",
  telegram_order_notifications: false,
  telegram_payment_notifications: false,
  telegram_invoice_notifications: false,
  logo: null,
  cover: null,
};

const sectionLinks = [
  ["identity", "Identity", Store],
  ["branding", "Branding", Palette],
  ["billing", "Billing", CreditCard],
  ["telegram", "Telegram", Bell],
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowManage = canManageTenantSettings(user);
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramResult, setTelegramResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      api
        .get("/shops")
        .then((response) => {
          const nextShops = response.data.data.shops;
          setShops(nextShops);
          setShopId(nextShops[0]?.id || "");
        })
        .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load shops.")))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const load = useCallback(() => {
    if (!shopId) {
      return Promise.resolve();
    }

    setLoading(true);
    setError("");

    return api
      .get(`/shops/${shopId}/settings`)
      .then((response) => {
        const { shop, settings } = response.data.data;
        setForm({ ...initial, ...shop, ...settings, logo: null, cover: null });
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load settings.")))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(shopId)), [shopId, shops]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (["logo_path", "cover_path", "settings"].includes(key)) return;
      if (value !== null && value !== undefined) {
        data.append(key, typeof value === "boolean" ? (value ? "1" : "0") : value);
      }
    });

    try {
      await api.post(`/shops/${shopId}/settings`, data, { headers: { "Content-Type": "multipart/form-data" } });
      await toastSuccess("Settings saved.");
      load();
    } catch (requestError) {
      alertError(requestError, "Please review the settings.");
    } finally {
      setSaving(false);
    }
  };

  const testTelegram = async () => {
    setTestingTelegram(true);
    setTelegramResult(null);

    try {
      const response = await api.post(`/shops/${shopId}/notifications/test-telegram`);
      setTelegramResult(response.data.data.notification);
      await toastSuccess("Telegram test processed.");
    } catch (requestError) {
      alertError(requestError, "Telegram test failed.");
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading && !form.name) return <LoadingState message="Loading settings..." />;
  if (error && !form.name) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Settings"
        title={t("pageTitles.settingsTitle")}
        description={t("pageTitles.settingsSubtitle")}
        secondaryActions={!allowManage ? <AppBadge status="warning">Owner-only editing</AppBadge> : null}
        primaryAction={allowManage ? {
          children: t("pageTitles.settingsCta"),
          type: "submit",
          form: "settings-form",
          loading: saving,
          disabled: saving || !shopId,
          iconLeft: <Save className="h-4 w-4" aria-hidden="true" />,
        } : null}
      />

      <AppCard bodyClassName="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,360px)_1fr] sm:items-end">
          <Select
            label="Shop"
            value={shopId}
            onChange={(event) => setShopId(event.target.value)}
            options={shops.map((shop) => [shop.id, shop.name])}
            description="Choose the shop workspace to configure."
          />
          <div className="flex flex-wrap gap-2">
            {sectionLinks.map(([id, label, Icon]) => (
              <a key={id} href={`#${id}`} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
        {!allowManage ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">You can view settings, but only owners can edit them.</p> : null}
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form id="settings-form" onSubmit={submit} className="grid gap-6">
          <AppCard id="identity" title="Identity" description="Customer-facing restaurant details used across QR menu and receipts." labelled bodyClassName="grid gap-4">
            <Input disabled={!allowManage} label="Shop name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input disabled={!allowManage} label="Phone" value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <Input disabled={!allowManage} label="Email" type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <Input disabled={!allowManage} label="Address" value={form.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            <Textarea disabled={!allowManage} label="Description" description="Short public copy that helps customers before ordering." value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </AppCard>

          <AppCard id="branding" title="Branding" description="Keep colors readable and images sized for menu previews." labelled bodyClassName="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input disabled={!allowManage} label="Primary color" type="color" value={form.primary_color || "#f97316"} onChange={(event) => setForm({ ...form, primary_color: event.target.value })} />
              <Input disabled={!allowManage} label="Secondary color" type="color" value={form.secondary_color || "#111827"} onChange={(event) => setForm({ ...form, secondary_color: event.target.value })} />
              <Select disabled={!allowManage} label="Base currency" value={form.base_currency || form.currency_code || "KHR"} onChange={(event) => setForm({ ...form, base_currency: event.target.value, currency_code: event.target.value, secondary_currency: event.target.value === "KHR" ? "USD" : "KHR" })}>
                <option value="KHR">KHR</option>
                <option value="USD">USD</option>
              </Select>
            </div>
            {allowManage ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Logo" type="file" accept="image/*" description="Square logo for shop identity." onChange={(event) => setForm({ ...form, logo: event.target.files?.[0] || null })} />
                <Input label="Cover" type="file" accept="image/*" description="Wide image for QR menu headers." onChange={(event) => setForm({ ...form, cover: event.target.files?.[0] || null })} />
              </div>
            ) : null}
          </AppCard>

          <AppCard id="billing" title="Billing defaults" description="Configure receipt totals, charges, currency display, and document prefixes." labelled bodyClassName="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow disabled={!allowManage} checked={Boolean(form.order_auto_accept)} onChange={(checked) => setForm({ ...form, order_auto_accept: checked })} label="Auto-accept new orders" description="Use only when staff can process every submitted order immediately." />
              <ToggleRow disabled={!allowManage} checked={Boolean(form.display_secondary_currency)} onChange={(checked) => setForm({ ...form, display_secondary_currency: checked })} label="Show secondary currency on receipts" description="Helpful when receipts show both KHR and USD totals." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select disabled={!allowManage} label="Secondary currency" value={form.secondary_currency || "USD"} onChange={(event) => setForm({ ...form, secondary_currency: event.target.value })}>
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
              </Select>
              <Input disabled={!allowManage} label="Exchange rate (KHR per USD)" type="number" min="0" step="0.0001" value={form.exchange_rate ?? 4100} onChange={(event) => setForm({ ...form, exchange_rate: event.target.value })} />
              <Input disabled={!allowManage} label="Default discount %" type="number" min="0" max="100" value={form.default_discount_percentage ?? 0} onChange={(event) => setForm({ ...form, default_discount_percentage: event.target.value })} />
              <Input disabled={!allowManage} label="Service charge %" type="number" min="0" max="100" value={form.service_charge_percentage ?? 0} onChange={(event) => setForm({ ...form, service_charge_percentage: event.target.value })} />
              <Input disabled={!allowManage} label="Tax %" type="number" min="0" max="100" value={form.tax_percentage ?? 0} onChange={(event) => setForm({ ...form, tax_percentage: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input disabled={!allowManage} label="Invoice prefix" value={form.invoice_prefix || "INV"} onChange={(event) => setForm({ ...form, invoice_prefix: event.target.value.toUpperCase() })} />
              <Input disabled={!allowManage} label="Receipt prefix" value={form.receipt_prefix || "RCPT"} onChange={(event) => setForm({ ...form, receipt_prefix: event.target.value.toUpperCase() })} />
            </div>
            <Textarea disabled={!allowManage} label="Receipt footer" value={form.receipt_footer_text || ""} onChange={(event) => setForm({ ...form, receipt_footer_text: event.target.value })} />
          </AppCard>

          <AppCard id="telegram" title="Telegram notifications" description="Send operational alerts for new orders, payment updates, and paid invoices." labelled action={allowManage ? <AppButton type="button" variant="secondary" disabled={!shopId || testingTelegram} loading={testingTelegram} onClick={testTelegram}>Test Telegram</AppButton> : null} bodyClassName="grid gap-4">
            <ToggleRow disabled={!allowManage} checked={Boolean(form.telegram_enabled)} onChange={(checked) => setForm({ ...form, telegram_enabled: checked })} label="Enable Telegram notifications" description="Telegram sends only when a valid chat ID and notification types are enabled." />
            <Input disabled={!allowManage} label="Telegram chat ID" value={form.telegram_chat_id || ""} onChange={(event) => setForm({ ...form, telegram_chat_id: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-3">
              <CheckPill disabled={!allowManage} checked={Boolean(form.telegram_order_notifications)} onChange={(checked) => setForm({ ...form, telegram_order_notifications: checked })}>Orders</CheckPill>
              <CheckPill disabled={!allowManage} checked={Boolean(form.telegram_payment_notifications)} onChange={(checked) => setForm({ ...form, telegram_payment_notifications: checked })}>Payments</CheckPill>
              <CheckPill disabled={!allowManage} checked={Boolean(form.telegram_invoice_notifications)} onChange={(checked) => setForm({ ...form, telegram_invoice_notifications: checked })}>Invoices</CheckPill>
            </div>
            {telegramResult ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-black text-slate-950">Last test: {telegramResult.status}</p>
                {telegramResult.error_message ? <p className="mt-1 font-semibold text-rose-600">{telegramResult.error_message}</p> : null}
                {telegramResult.message_preview ? <p className="mt-1 text-slate-500">{telegramResult.message_preview}</p> : null}
              </div>
            ) : null}
          </AppCard>

          {allowManage ? (
            <div className="sticky bottom-4 z-10 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-600">Saving updates the selected shop settings only.</p>
                <AppButton type="submit" loading={saving} disabled={saving || !shopId} iconLeft={<Save className="h-4 w-4" aria-hidden="true" />}>Save settings</AppButton>
              </div>
            </div>
          ) : null}
        </form>

        <div className="grid h-fit gap-4">
          <BrandPreview form={form} selectedShop={selectedShop} />
          <AppCard title="Access" description="Settings changes are limited to owner-level roles." bodyClassName="grid gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" aria-hidden="true" />
              <div>
                <p className="font-black text-slate-900">{allowManage ? "Editing enabled" : "View only"}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{allowManage ? "You can update branding, billing defaults, and notification settings." : "Ask a shop owner to update settings for this workspace."}</p>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <input disabled={disabled} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
    </label>
  );
}

function CheckPill({ children, checked, onChange, disabled }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
      <span>{children}</span>
      <input disabled={disabled} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
    </label>
  );
}

function BrandPreview({ form, selectedShop }) {
  const preview = { ...(selectedShop || {}), ...form };

  return (
    <AppCard title="Brand preview" description="A quick visual check for the public QR menu identity." className="h-fit">
      <div className="overflow-hidden rounded-3xl border border-slate-200 text-white shadow-sm" style={{ backgroundColor: preview.secondary_color || "#111827" }}>
        <div
          className="h-24"
          style={{
            backgroundColor: preview.primary_color || "#f97316",
            backgroundImage: preview.cover_path ? `url(${preview.cover_path})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="p-4">
          <div className="flex items-center gap-3">
            {preview.logo_path ? (
              <img src={preview.logo_path} alt="" className="h-12 w-12 rounded-2xl border border-white/30 object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-lg font-black" aria-hidden="true">{String(preview.name || "S").slice(0, 1).toUpperCase()}</div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-black">{preview.name || "Shop name"}</p>
              <p className="text-sm text-white/70">{preview.base_currency || preview.currency_code || "KHR"}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/75">{preview.description || "Shop description appears here."}</p>
          <p className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
            Discount {Number(preview.default_discount_percentage || 0).toLocaleString()}% · Service {Number(preview.service_charge_percentage || 0).toLocaleString()}% · Tax {Number(preview.tax_percentage || 0).toLocaleString()}%
          </p>
        </div>
      </div>
    </AppCard>
  );
}
