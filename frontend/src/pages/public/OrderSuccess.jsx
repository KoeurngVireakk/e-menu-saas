import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import LiveOrderStatus from "../../components/orders/LiveOrderStatus";
import StatusBadge from "../../components/StatusBadge";
import { Button, Card, ErrorState, LoadingState } from "../../components/ui";
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
  if (!order) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4"><LoadingState message="Loading order..." /></div>;

  const updateOrderStatus = (payload) => {
    setOrder((current) => current ? { ...current, order_status: payload.new_status } : current);
  };

  const updatePaymentStatus = () => {
    setOrder((current) => current ? { ...current, payment_status: "paid" } : current);
  };

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4 text-center" lang={locale}>
      <Card className="mt-10 p-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">OK</div>
        <h1 className="mt-5 text-3xl font-black text-slate-950">{t(locale, "orderSubmitted")}</h1>
        <p className="mt-2 text-slate-500">{order.order_number}</p>
        <div className="mt-4 flex justify-center gap-2">
          <StatusBadge value={order.order_status} />
          <StatusBadge value={order.payment_status} />
        </div>
        <div className="mt-3 flex justify-center">
          <LiveOrderStatus order={order} onStatusChanged={updateOrderStatus} onPaymentConfirmed={updatePaymentStatus} />
        </div>
        <p className="mt-6 text-4xl font-black text-orange-700">
          {formatDualCurrency(order.grand_total, order.currency_code, order.secondary_currency_total, order.secondary_currency_code)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="secondary" onClick={() => setShowReceipt((value) => !value)}>
            {showReceipt ? "Hide receipt" : "View receipt"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>Print/Save</Button>
        </div>
        {showReceipt ? <CustomerReceipt order={order} /> : null}
        <Button as={Link} variant="dark" size="lg" className="mt-6" to={`/payment/${order.order_number}?locale=${locale}`}>
          Continue to payment
        </Button>
      </Card>
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
