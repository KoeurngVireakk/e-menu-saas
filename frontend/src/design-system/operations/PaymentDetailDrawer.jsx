import { CheckCircle2, XCircle } from "lucide-react";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppSheet from "../components/AppSheet";
import { formatCurrency } from "../../utils/currency";
import OperationTimeline from "./OperationTimeline";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { failedPaymentReason, providerLabel } from "./paymentReview";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function PaymentDetailDrawer({ payment, open, onClose, onConfirm, onReject, allowActions }) {
  if (!payment) return null;

  const proofUrl = payment.proof_image_path ? `${storageUrl}/${payment.proof_image_path}` : "";

  return (
    <AppSheet open={open} title={payment.order?.order_number || `Payment #${payment.id}`} onClose={onClose} size="lg">
      <div className="grid gap-5">
        <AppCard bodyClassName="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">Payment review</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(payment.amount, payment.currency_code)}</h2>
              <p className="mt-1 text-sm text-slate-500">{payment.payment_method} · {providerLabel(payment)}</p>
            </div>
            <PaymentStatusBadge value={payment.status} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Order" value={payment.order?.order_number || "-"} />
            <Detail label="Reference" value={payment.provider_reference || payment.transaction_reference || "-"} />
            <Detail label="Provider payment ID" value={payment.provider_payment_id || "-"} />
            <Detail label="Failure reason" value={payment.failure_reason || failedPaymentReason(payment) || "-"} />
          </div>
        </AppCard>

        {proofUrl ? (
          <AppCard title="Proof image" description="Review the customer-submitted payment proof before confirming.">
            <a href={proofUrl} target="_blank" rel="noreferrer">
              <img src={proofUrl} alt={`Payment proof for ${payment.order?.order_number || `payment ${payment.id}`}`} className="max-h-96 w-full rounded-2xl border border-slate-200 object-contain" />
            </a>
          </AppCard>
        ) : null}

        {allowActions ? (
          <AppCard title="Review action">
            <div className="flex flex-wrap gap-2">
              <AppButton type="button" variant="success" iconLeft={<CheckCircle2 className="h-4 w-4" />} onClick={() => onConfirm(payment)}>Confirm payment</AppButton>
              <AppButton type="button" variant="danger" iconLeft={<XCircle className="h-4 w-4" />} onClick={() => onReject(payment)}>Reject payment</AppButton>
            </div>
          </AppCard>
        ) : null}

        <AppCard title="Payment timeline">
          <OperationTimeline
            items={(payment.logs || []).map((log) => ({
              label: log.action,
              description: log.payload_json?.reason,
              time: log.created_at ? new Date(log.created_at).toLocaleString() : null,
            }))}
          />
        </AppCard>
      </div>
    </AppSheet>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 wrap-break-word font-bold text-slate-900">{value}</p>
    </div>
  );
}
