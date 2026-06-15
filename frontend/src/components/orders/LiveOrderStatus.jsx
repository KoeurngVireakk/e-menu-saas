import useOperationsRealtime from "../../hooks/useOperationsRealtime";
import RealtimeStatusBadge from "../realtime/RealtimeStatusBadge";

export default function LiveOrderStatus({ order, onStatusChanged, onPaymentConfirmed }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("emenu_token") : null;
  const status = useOperationsRealtime({
    enabled: Boolean(token && order?.id),
    orderId: order?.id,
    onOrderStatusChanged: onStatusChanged,
    onPaymentConfirmed,
  });

  if (!token) {
    return (
      <p className="text-xs font-semibold text-slate-500">
        Live private tracking will be available after secure guest tracking tokens are enabled.
      </p>
    );
  }

  return <RealtimeStatusBadge status={status} />;
}
