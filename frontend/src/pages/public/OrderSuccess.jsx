import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, CreditCard, Printer, ReceiptText, Send, Star } from "lucide-react";
import api from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import LiveOrderStatus from "../../components/orders/LiveOrderStatus";
import OrderStatusTimeline from "../../components/public/OrderStatusTimeline";
import PaymentStatusCard from "../../components/public/PaymentStatusCard";
import { PublicPageSkeleton } from "../../components/public/PublicSkeletons";
import { AppBadge, AppButton, AppCard } from "../../design-system/components";
import { ErrorState, Textarea, alertError, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { formatCurrency, formatDualCurrency } from "../../utils/currency";
import { getPreferredLocale, normalizeLocale, t } from "../../utils/localization";

function orderStatusCacheKey(orderNumber) {
  return `menudigi_order_status:${orderNumber}`;
}

function safeOrderSnapshot(order) {
  return {
    id: order.id,
    order_number: order.order_number,
    order_status: order.order_status,
    payment_status: order.payment_status,
    grand_total: order.grand_total,
    currency_code: order.currency_code,
    secondary_currency_total: order.secondary_currency_total,
    secondary_currency_code: order.secondary_currency_code,
    shop: order.shop ? { name: order.shop.name, currency_code: order.shop.currency_code } : null,
    branch: order.branch ? { name: order.branch.name } : null,
    review: order.review || null,
    items: [],
  };
}

function readOrderSnapshot(orderNumber) {
  try {
    return JSON.parse(localStorage.getItem(orderStatusCacheKey(orderNumber)) || "null");
  } catch {
    localStorage.removeItem(orderStatusCacheKey(orderNumber));
    return null;
  }
}

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const locale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [cachedStatus, setCachedStatus] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => {
        const nextOrder = response.data.data.order;
        setOrder(nextOrder);
        setCachedStatus(false);
        localStorage.setItem(orderStatusCacheKey(orderNumber), JSON.stringify(safeOrderSnapshot(nextOrder)));
      })
      .catch((requestError) => {
        const cached = readOrderSnapshot(orderNumber);
        if (!online && cached) {
          setOrder(cached);
          setCachedStatus(true);
          setError("");
          return;
        }

        setError(!online ? t(locale, "reconnectOrderStatus") : requestError.response?.data?.message || "Order could not be loaded.");
      });
  }, [locale, orderNumber, online]);

  if (error) return <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{!online ? <OfflineBanner locale={locale} /> : null}<ErrorState message={error} /></div>;
  if (!order) return <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{!online ? <OfflineBanner locale={locale} /> : null}<PublicPageSkeleton label={t(locale, "loadingOrder")} /></div>;

  const updateOrderStatus = (payload) => {
    setOrder((current) => current ? { ...current, order_status: payload.new_status } : current);
  };

  const updatePaymentStatus = () => {
    setOrder((current) => current ? { ...current, payment_status: "paid" } : current);
  };

  const reviewEligible = online && order.order_status === "completed" && order.payment_status === "paid";
  const submitReview = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    try {
      const response = await api.post(`/public/orders/${order.order_number}/review`, reviewForm);
      setOrder((current) => current ? { ...current, review: response.data.data.review } : current);
      await toastSuccess(t(locale, "reviewSubmitted"));
    } catch (requestError) {
      alertError(requestError, t(locale, "reviewSubmitError"));
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center" lang={locale}>
      {!online ? <OfflineBanner locale={locale} /> : null}
      {cachedStatus ? (
        <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="status">
          {t(locale, "cachedOrderStatus")}
        </p>
      ) : null}
      <AppCard className="mt-6" bodyClassName="p-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="khmer-heading mt-5 text-3xl font-black text-slate-950">{t(locale, "orderSubmitted")}</h1>
        <p className="khmer-text mt-2 text-slate-500">{t(locale, "orderReceivedDescription")}</p>
        <p className="khmer-text mx-auto mt-2 max-w-sm rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-800">{t(locale, "orderNextStep")}</p>
        <p className="mt-3 text-lg font-black text-slate-950">{order.order_number}</p>
        <div className="mt-4 flex justify-center gap-2">
          <AppBadge status={order.order_status}>{order.order_status}</AppBadge>
          <AppBadge status={order.payment_status === "confirmed" ? "paid" : order.payment_status}>{order.payment_status}</AppBadge>
        </div>
        {online ? <div className="mt-3 flex justify-center">
          <LiveOrderStatus order={order} onStatusChanged={updateOrderStatus} onPaymentConfirmed={updatePaymentStatus} />
        </div> : (
          <p className="mt-3 text-sm font-semibold text-amber-800">{t(locale, "reconnectOrderStatus")}</p>
        )}
        <p className="mt-6 text-4xl font-black text-blue-700">
          {formatDualCurrency(order.grand_total, order.currency_code, order.secondary_currency_total, order.secondary_currency_code)}
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:justify-center">
          <AppButton type="button" variant="secondary" iconLeft={<ReceiptText className="h-4 w-4" />} onClick={() => setShowReceipt((value) => !value)}>
            {showReceipt ? t(locale, "hideReceipt") : t(locale, "viewReceipt")}
          </AppButton>
          <AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => window.print()}>{t(locale, "printSave")}</AppButton>
        </div>
        {showReceipt ? <CustomerReceipt order={order} locale={locale} /> : null}
        {order.payment_status !== "paid" && order.payment_status !== "confirmed" ? (
          <AppButton as={Link} size="lg" className="mt-6 w-full sm:w-auto" iconLeft={<CreditCard className="h-4 w-4" />} to={`/payment/${order.order_number}?locale=${locale}`}>
            {t(locale, "continuePayment")}
          </AppButton>
        ) : null}
      </AppCard>

      <div className="mt-4 grid gap-4">
        <OrderStatusTimeline status={order.order_status} />
        <PaymentStatusCard order={order} />
        <ReviewPanel
          order={order}
          locale={locale}
          eligible={reviewEligible}
          form={reviewForm}
          submitting={reviewSubmitting}
          onChange={setReviewForm}
          onSubmit={submitReview}
        />
      </div>
    </div>
  );
}

function ReviewPanel({ order, locale, eligible, form, submitting, onChange, onSubmit }) {
  if (order.review) {
    return (
      <AppCard bodyClassName="p-5 text-left">
        <p className="khmer-heading text-lg font-black text-slate-950">{t(locale, "reviewThanksTitle")}</p>
        <RatingInput value={order.review.rating} readOnly />
        {order.review.comment ? <p className="khmer-text mt-3 text-sm font-semibold leading-6 text-slate-600">{order.review.comment}</p> : null}
      </AppCard>
    );
  }

  if (!eligible) {
    return (
      <AppCard bodyClassName="p-5 text-left">
        <p className="khmer-heading text-lg font-black text-slate-950">{t(locale, "reviewLockedTitle")}</p>
        <p className="khmer-text mt-2 text-sm font-semibold leading-6 text-slate-500">{t(locale, "reviewLockedDescription")}</p>
      </AppCard>
    );
  }

  return (
    <AppCard bodyClassName="p-5 text-left">
      <p className="khmer-heading text-lg font-black text-slate-950">{t(locale, "reviewFormTitle")}</p>
      <p className="khmer-text mt-2 text-sm font-semibold leading-6 text-slate-500">{t(locale, "reviewFormDescription")}</p>
      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <div>
          <p className="khmer-label text-sm font-bold text-slate-700">{t(locale, "rating")}</p>
          <RatingInput value={form.rating} onChange={(rating) => onChange({ ...form, rating })} />
        </div>
        <Textarea label={t(locale, "reviewComment")} value={form.comment} maxLength={1000} onChange={(event) => onChange({ ...form, comment: event.target.value })} />
        <AppButton type="submit" loading={submitting} disabled={submitting} iconLeft={<Send className="h-4 w-4" aria-hidden="true" />}>{t(locale, "submitReview")}</AppButton>
      </form>
    </AppCard>
  );
}

function RatingInput({ value, onChange, readOnly = false }) {
  return (
    <div className="mt-2 flex gap-1" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button key={rating} type="button" disabled={readOnly} aria-label={`${rating} stars`} onClick={() => onChange?.(rating)} className="rounded-xl p-1 text-amber-400 disabled:cursor-default">
          <Star className={`h-7 w-7 ${rating <= value ? "fill-amber-400" : "fill-transparent text-slate-300"}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function CustomerReceipt({ order, locale }) {
  return (
    <div className="receipt-print mt-5 rounded-md border border-slate-200 bg-white p-4 text-left text-sm print:border-0">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible; }
          .receipt-print { position: absolute; left: 0; top: 0; width: 80mm; font-size: 11px; }
        }
      `}</style>
      <div className="text-center">
        <p className="font-black">{order.shop?.name || "E-Menu"}</p>
        <p className="text-xs text-slate-500">{order.branch?.name || ""}</p>
      </div>
      <div className="mt-3 grid gap-2">
        {(order.items || []).map((item) => (
          <div key={item.id} className="flex justify-between gap-3">
            <span>{item.quantity} x {item.product_name}</span>
            <span>{formatCurrency(item.total_price, order.currency_code)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-1 border-t border-dashed border-slate-300 pt-3">
        <SummaryRow label={t(locale, "subtotal")} value={formatCurrency(order.subtotal, order.currency_code)} />
        <SummaryRow label={t(locale, "discount")} value={`-${formatCurrency(order.discount_total, order.currency_code)}`} />
        <SummaryRow label={t(locale, "service")} value={formatCurrency(order.service_charge, order.currency_code)} />
        <SummaryRow label={t(locale, "tax")} value={formatCurrency(order.tax_total, order.currency_code)} />
        <SummaryRow label={t(locale, "total")} value={formatDualCurrency(order.grand_total, order.currency_code, order.secondary_currency_total, order.secondary_currency_code)} strong />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "text-base font-black" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
