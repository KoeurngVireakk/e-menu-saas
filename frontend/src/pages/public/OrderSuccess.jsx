import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, CreditCard, Printer, ReceiptText } from "lucide-react";
import api from "../../api/axios";
import LiveOrderStatus from "../../components/orders/LiveOrderStatus";
import OrderStatusTimeline from "../../components/public/OrderStatusTimeline";
import PaymentStatusCard from "../../components/public/PaymentStatusCard";
import { PublicPageSkeleton } from "../../components/public/PublicSkeletons";
import { AppBadge, AppButton, AppCard } from "../../design-system/components";
import { ErrorState } from "../../components/ui";
import { formatCurrency, formatDualCurrency } from "../../utils/currency";
import { getPreferredLocale, normalizeLocale, t } from "../../utils/localization";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const locale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => setOrder(response.data.data.order))
      .catch((requestError) => setError(requestError.response?.data?.message || "Order could not be loaded."));
  }, [orderNumber]);

  if (error) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4"><ErrorState message={error} /></div>;
  if (!order) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4"><PublicPageSkeleton label="Loading order..." /></div>;

  const updateOrderStatus = (payload) => {
    setOrder((current) => current ? { ...current, order_status: payload.new_status } : current);
  };

  const updatePaymentStatus = () => {
    setOrder((current) => current ? { ...current, payment_status: "paid" } : current);
  };

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4 pb-24 text-center" lang={locale}>
      <AppCard className="mt-6" bodyClassName="p-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-950">{t(locale, "orderSubmitted")}</h1>
        <p className="mt-2 text-slate-500">Your order has been sent to the restaurant. Please wait while the kitchen prepares your food.</p>
        <p className="mt-3 text-lg font-black text-slate-950">{order.order_number}</p>
        <div className="mt-4 flex justify-center gap-2">
          <AppBadge status={order.order_status}>{order.order_status}</AppBadge>
          <AppBadge status={order.payment_status === "confirmed" ? "paid" : order.payment_status}>{order.payment_status}</AppBadge>
        </div>
        <div className="mt-3 flex justify-center">
          <LiveOrderStatus order={order} onStatusChanged={updateOrderStatus} onPaymentConfirmed={updatePaymentStatus} />
        </div>
        <p className="mt-6 text-4xl font-black text-blue-700">
          {formatDualCurrency(order.grand_total, order.currency_code, order.secondary_currency_total, order.secondary_currency_code)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <AppButton type="button" variant="secondary" iconLeft={<ReceiptText className="h-4 w-4" />} onClick={() => setShowReceipt((value) => !value)}>
            {showReceipt ? "Hide receipt" : "View receipt"}
          </AppButton>
          <AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print/Save</AppButton>
        </div>
        {showReceipt ? <CustomerReceipt order={order} /> : null}
        {order.payment_status !== "paid" && order.payment_status !== "confirmed" ? (
          <AppButton as={Link} size="lg" className="mt-6" iconLeft={<CreditCard className="h-4 w-4" />} to={`/payment/${order.order_number}?locale=${locale}`}>
            Continue to payment
          </AppButton>
        ) : null}
      </AppCard>

      <div className="mt-4 grid gap-4">
        <OrderStatusTimeline status={order.order_status} />
        <PaymentStatusCard order={order} />
      </div>
    </div>
  );
}

function CustomerReceipt({ order }) {
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
        <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal, order.currency_code)} />
        <SummaryRow label="Discount" value={`-${formatCurrency(order.discount_total, order.currency_code)}`} />
        <SummaryRow label="Service" value={formatCurrency(order.service_charge, order.currency_code)} />
        <SummaryRow label="VAT/Tax" value={formatCurrency(order.tax_total, order.currency_code)} />
        <SummaryRow label="Total" value={formatDualCurrency(order.grand_total, order.currency_code, order.secondary_currency_total, order.secondary_currency_code)} strong />
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
