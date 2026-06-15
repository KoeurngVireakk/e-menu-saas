import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { Card, confirmAction, promptText, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { canManagePayments } from "../../../utils/permissions";

export default function PaymentsPage() {
  const { user } = useAuth();
  const allowPaymentActions = canManagePayments(user);
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");

    return api
      .get("/payments")
      .then((response) => setPayments(response.data.data.payments))
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load payments.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const confirm = async (payment) => {
    if (!await confirmAction("Confirm payment?", "This payment will be marked as paid.")) return;
    await api.put(`/payments/${payment.id}/confirm`);
    toastSuccess("Payment marked as paid.");
    load();
  };

  const reject = async (payment) => {
    const result = await promptText("Reject payment?", "Reason", "Reject");
    if (!result.isConfirmed) return;
    await api.put(`/payments/${payment.id}/reject`, { reason: result.value });
    toastSuccess("Payment was rejected.");
    load();
  };

  return (
    <div className="grid gap-6">
      {selected ? (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{selected.order?.order_number || `Payment #${selected.id}`}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {Number(selected.amount).toLocaleString()} {selected.currency_code} · {selected.payment_method}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
          </div>

          {failedPaymentReason(selected) ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Rejection reason: {failedPaymentReason(selected)}
            </div>
          ) : null}

          <div className="mt-4 grid gap-2">
            {(selected.logs || []).length ? selected.logs.map((log) => (
              <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-950">{log.action}</span>
                  <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                {log.payload_json?.reason ? <p className="mt-1 text-rose-600">{log.payload_json.reason}</p> : null}
              </div>
            )) : <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No payment logs available.</p>}
          </div>
        </Card>
      ) : null}

      <DataTable
        columns={[
          { key: "order", label: "Order", render: (row) => row.order?.order_number },
          { key: "payment_method", label: "Method" },
          { key: "amount", label: "Amount", render: (row) => `${Number(row.amount).toLocaleString()} ${row.currency_code}` },
          { key: "transaction_reference", label: "Reference" },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <div className="grid gap-1">
                <StatusBadge value={row.status} />
                {failedPaymentReason(row) ? <span className="text-xs text-rose-600">{failedPaymentReason(row)}</span> : null}
              </div>
            ),
          },
        ]}
        rows={payments}
        loading={loading}
        error={loadError}
        emptyMessage="No payments yet."
        renderActions={(payment) => (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelected(payment)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">View</button>
            {payment.proof_image_path ? <a href={`${import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage"}/${payment.proof_image_path}`} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 px-3 py-1 text-sm">Proof</a> : null}
            {allowPaymentActions ? <button onClick={() => confirm(payment)} className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white">Confirm</button> : null}
            {allowPaymentActions ? <button onClick={() => reject(payment)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Reject</button> : null}
          </div>
        )}
      />
    </div>
  );
}

function failedPaymentReason(payment) {
  const log = [...(payment.logs || [])].reverse().find((entry) => entry.action === "rejected");

  return log?.payload_json?.reason || "";
}
