import { CreditCard, Upload } from "lucide-react";
import { AppBadge, AppCard } from "../../design-system/components";
import { formatCurrency } from "../../utils/currency";

export default function PaymentStatusCard({ order }) {
  const payment = order.payment;
  const status = payment?.status || order.payment_status || "unpaid";
  const provider = payment?.provider === "bakong_khqr" ? "Bakong KHQR" : payment?.provider || "Manual";

  return (
    <AppCard bodyClassName="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="khmer-label text-xs font-black text-blue-600">Payment status</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(order.grand_total, order.currency_code || order.shop?.currency_code)}</h2>
          <p className="mt-1 text-sm text-slate-500">{order.order_number}</p>
        </div>
        <AppBadge status={status === "confirmed" ? "paid" : status}>{status === "confirmed" ? "paid" : status}</AppBadge>
      </div>
      {payment ? (
        <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />{payment.payment_method || provider}</p>
          {payment.transaction_reference || payment.provider_reference ? <p>Reference: <span className="font-bold text-slate-900">{payment.transaction_reference || payment.provider_reference}</span></p> : null}
        </div>
      ) : (
        <p className="khmer-text mt-4 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-800"><Upload className="h-4 w-4" aria-hidden="true" />Choose a payment method and submit proof if requested.</p>
      )}
    </AppCard>
  );
}
