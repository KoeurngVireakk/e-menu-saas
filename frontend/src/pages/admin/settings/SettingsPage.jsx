import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import { Button, Card, ErrorState, Input, LoadingState, Select, Textarea, alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
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

export default function SettingsPage() {
  const { user } = useAuth();
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
        setForm({
          ...initial,
          ...shop,
          ...settings,
          logo: null,
          cover: null,
        });
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load settings.")))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (["logo_path", "cover_path", "settings"].includes(key)) {
        return;
      }

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

  if (loading && !form.name) {
    return <LoadingState message="Loading settings..." />;
  }

  if (error && !form.name) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="grid gap-6">
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Tenant settings</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Settings</h1>
              <p className="mt-1 text-sm text-slate-500">Manage shop identity, branding, and order defaults.</p>
            </div>
            <Select label="Shop" value={shopId} onChange={(event) => setShopId(event.target.value)} options={shops.map((shop) => [shop.id, shop.name])} />
          </div>
          {!allowManage ? <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">You can view settings, but only owners can edit them.</p> : null}
        </Card>

        <Card className="grid gap-4 p-4">
          <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
          <Input disabled={!allowManage} label="Shop name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input disabled={!allowManage} label="Phone" value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Input disabled={!allowManage} label="Email" type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
          <Input disabled={!allowManage} label="Address" value={form.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <label className="block text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea disabled={!allowManage} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100" value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
        </Card>

        <Card className="grid gap-4 p-4">
          <h2 className="text-lg font-semibold text-slate-950">Branding</h2>
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
              <Input label="Logo" type="file" accept="image/*" onChange={(event) => setForm({ ...form, logo: event.target.files?.[0] || null })} />
              <Input label="Cover" type="file" accept="image/*" onChange={(event) => setForm({ ...form, cover: event.target.files?.[0] || null })} />
            </div>
          ) : null}
        </Card>

        <Card className="grid gap-4 p-4">
          <h2 className="text-lg font-semibold text-slate-950">Billing defaults</h2>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input disabled={!allowManage} type="checkbox" checked={Boolean(form.order_auto_accept)} onChange={(event) => setForm({ ...form, order_auto_accept: event.target.checked })} />
            Auto-accept new orders
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input disabled={!allowManage} type="checkbox" checked={Boolean(form.display_secondary_currency)} onChange={(event) => setForm({ ...form, display_secondary_currency: event.target.checked })} />
            Show secondary currency on receipts
          </label>
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
        </Card>

        <Card className="grid gap-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Telegram notifications</h2>
              <p className="mt-1 text-sm text-slate-500">Notify staff about new orders, payments, and paid invoices.</p>
            </div>
            {allowManage ? (
              <Button type="button" variant="secondary" disabled={!shopId || testingTelegram} onClick={testTelegram}>
                {testingTelegram ? "Testing..." : "Test Telegram"}
              </Button>
            ) : null}
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input disabled={!allowManage} type="checkbox" checked={Boolean(form.telegram_enabled)} onChange={(event) => setForm({ ...form, telegram_enabled: event.target.checked })} />
            Enable Telegram notifications
          </label>
          <Input disabled={!allowManage} label="Telegram chat ID" value={form.telegram_chat_id || ""} onChange={(event) => setForm({ ...form, telegram_chat_id: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input disabled={!allowManage} type="checkbox" checked={Boolean(form.telegram_order_notifications)} onChange={(event) => setForm({ ...form, telegram_order_notifications: event.target.checked })} />
              Orders
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input disabled={!allowManage} type="checkbox" checked={Boolean(form.telegram_payment_notifications)} onChange={(event) => setForm({ ...form, telegram_payment_notifications: event.target.checked })} />
              Payments
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input disabled={!allowManage} type="checkbox" checked={Boolean(form.telegram_invoice_notifications)} onChange={(event) => setForm({ ...form, telegram_invoice_notifications: event.target.checked })} />
              Invoices
            </label>
          </div>
          {telegramResult ? (
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-950">Last test: {telegramResult.status}</p>
              {telegramResult.error_message ? <p className="mt-1 text-rose-600">{telegramResult.error_message}</p> : null}
              {telegramResult.message_preview ? <p className="mt-1 text-slate-500">{telegramResult.message_preview}</p> : null}
            </div>
          ) : null}
        </Card>

        {allowManage ? <Button type="submit" disabled={saving || !shopId}>{saving ? "Saving..." : "Save settings"}</Button> : null}
      </form>

      <Card className="h-fit p-4">
        <p className="text-sm font-semibold text-slate-950">Preview</p>
        <div className="mt-4 rounded-md border border-slate-200 p-4" style={{ borderTop: `5px solid ${form.primary_color || "#f97316"}` }}>
          <p className="text-xl font-bold" style={{ color: form.secondary_color || "#111827" }}>{form.name || "Shop name"}</p>
          <p className="mt-1 text-sm text-slate-500">{form.description || "Shop description appears here."}</p>
          <p className="mt-3 text-sm font-semibold text-slate-700">{form.base_currency || form.currency_code || "KHR"}</p>
          <p className="mt-3 text-xs text-slate-500">
            Discount {Number(form.default_discount_percentage || 0).toLocaleString()}% · Service {Number(form.service_charge_percentage || 0).toLocaleString()}% · Tax {Number(form.tax_percentage || 0).toLocaleString()}%
          </p>
        </div>
      </Card>
    </div>
  );
}
