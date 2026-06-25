import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import PublicCartSummary from "../../components/public/PublicCartSummary";
import PublicEmptyState from "../../components/public/PublicEmptyState";
import { AppButton, AppCard } from "../../design-system/components";
import { Input, Select, Textarea, alertError, alertWarning, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { cartTotal, clearCart, itemTotal, money, readCart, writeCart } from "../../utils/cart";
import { getPreferredLocale, normalizeLocale, t } from "../../utils/localization";

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const locale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const navigate = useNavigate();
  const cartContext = useMemo(() => ({
    shopSlug: searchParams.get("shop_slug") || searchParams.get("shop") || "public",
    branchId: searchParams.get("branch") || "",
    tableCode: searchParams.get("table") || "",
  }), [searchParams]);
  const [cart, setCart] = useState(() => readCart(cartContext));
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", note: "", order_type: searchParams.get("table") ? "dine_in" : "takeaway" });
  const [saving, setSaving] = useState(false);
  const online = useOnlineStatus();
  const total = cartTotal(cart);
  const itemCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    writeCart(cart, cartContext);
  }, [cart, cartContext]);

  const changeQuantity = (key, quantity) => {
    setCart((items) => (
      quantity < 1
        ? items.filter((item) => item.key !== key)
        : items.map((item) => item.key === key ? { ...item, quantity, item_total: itemTotal({ ...item, quantity }) } : item)
    ));
  };

  const remove = (key) => {
    setCart((items) => items.filter((item) => item.key !== key));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!online) {
      await alertWarning(t(locale, "offlineTitle"), t(locale, "offlineSubmit"));
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/public/orders", {
        shop_id: searchParams.get("shop"),
        branch_id: searchParams.get("branch"),
        table_code: searchParams.get("table") || null,
        ...form,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: item.note || null,
          selected_options: item.selected_options || [],
        })),
      });
      clearCart();
      setCart([]);
      await toastSuccess(`${t(locale, "orderSubmitted")} ${response.data.data.order.order_number}`);
      navigate(`/order-success/${response.data.data.order.order_number}?locale=${locale}`);
    } catch (error) {
      alertError(error, t(locale, "reviewCart"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-2xl bg-slate-50 p-4 pb-[calc(8rem+env(safe-area-inset-bottom))]" lang={locale}>
      {!online ? <OfflineBanner locale={locale} /> : null}
      <header className="mb-5">
        <AppButton type="button" variant="ghost" size="sm" iconLeft={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>{t(locale, "backToMenu")}</AppButton>
        <p className="khmer-label mt-4 text-xs font-black text-blue-600">{t(locale, "checkout")}</p>
        <h1 className="khmer-heading mt-1 text-3xl font-black text-slate-950">{t(locale, "cart")}</h1>
        <p className="khmer-text mt-2 text-sm text-slate-500">{t(locale, "checkoutDescription")}</p>
      </header>

      {!cart.length ? <PublicEmptyState title={t(locale, "cartEmpty")} description={t(locale, "emptyCartMessage")} actionLabel={t(locale, "returnToMenu")} onAction={() => navigate(-1)} /> : null}
      {cart.length ? <PublicCartSummary cart={cart} locale={locale} onQuantity={changeQuantity} onRemove={remove} /> : null}

      {cart.length ? (
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <div className="grid grid-cols-3 gap-2 rounded-3xl border border-blue-100 bg-blue-50/70 p-2 text-center">
          {[t(locale, "checkoutStepReview"), t(locale, "checkoutStepDetails"), t(locale, "checkoutStepSend")].map((step, index) => (
            <span key={step} className="khmer-text rounded-2xl bg-white px-2 py-2 text-xs font-black leading-5 text-blue-800 shadow-sm">
              {index + 1}. {step}
            </span>
          ))}
        </div>
        <AppCard title={t(locale, "customerDetails")} description={t(locale, "customerDetailsHelp")} bodyClassName="grid gap-3 p-4">
          <Input label={t(locale, "customerName")} placeholder={t(locale, "customerName")} value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
          <Input label={t(locale, "customerPhone")} placeholder={t(locale, "customerPhone")} value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} />
          <Select label={t(locale, "orderType")} value={form.order_type} onChange={(event) => setForm({ ...form, order_type: event.target.value })}>
            <option value="dine_in">{t(locale, "dineIn")}</option>
            <option value="takeaway">{t(locale, "takeaway")}</option>
          </Select>
          <Textarea label={t(locale, "orderNote")} placeholder={t(locale, "orderNote")} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </AppCard>

        <AppCard bodyClassName="grid gap-2 p-4">
          <SummaryRow label={`${itemCount} ${t(locale, itemCount === 1 ? "item" : "items")}`} value={`${money(total)} KHR`} />
          <SummaryRow label={t(locale, "total")} value={`${money(total)} KHR`} strong />
          <p className="khmer-text rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">{t(locale, "checkoutTotalHelp")}</p>
          {!online ? (
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
              {t(locale, "offlineSubmit")}
            </p>
          ) : null}
        </AppCard>

        <div className="premium-surface sticky bottom-0 flex flex-col gap-3 rounded-3xl border bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:bottom-4 sm:flex-row sm:items-center sm:justify-between sm:pb-3">
          <div>
            <p className="khmer-label text-xs font-black text-blue-600">{t(locale, "total")}</p>
            <p className="text-xl font-black text-slate-950">{money(total)} KHR</p>
          </div>
          <AppButton type="submit" className="w-full sm:w-auto" disabled={!cart.length || saving || !online || !searchParams.get("shop") || !searchParams.get("branch")} title={!online ? t(locale, "offlineSubmit") : undefined} iconLeft={<ReceiptText className="h-4 w-4" />}>
            {saving ? t(locale, "submitting") : t(locale, "submitOrder")}
          </AppButton>
        </div>
      </form>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-lg font-black text-slate-950" : "text-sm font-semibold text-slate-600"}`}>
      <span className="khmer-text">{label}</span>
      <span>{value}</span>
    </div>
  );
}
