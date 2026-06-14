import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { confirmAction, toastSuccess } from "../../../components/ui";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");

    return api
      .get("/payments")
      .then((response) => setPayments(response.data.data.payments))
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load payments."))
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
    const result = await Swal.fire({ title: "Reject payment?", input: "text", inputLabel: "Reason", icon: "warning", showCancelButton: true, confirmButtonText: "Reject" });
    if (!result.isConfirmed) return;
    await api.put(`/payments/${payment.id}/reject`, { reason: result.value });
    toastSuccess("Payment was rejected.");
    load();
  };

  return (
    <DataTable
      columns={[
        { key: "order", label: "Order", render: (row) => row.order?.order_number },
        { key: "payment_method", label: "Method" },
        { key: "amount", label: "Amount", render: (row) => `${Number(row.amount).toLocaleString()} ${row.currency_code}` },
        { key: "transaction_reference", label: "Reference" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
      ]}
      rows={payments}
      loading={loading}
      error={loadError}
      emptyMessage="No payments yet."
      renderActions={(payment) => (
        <div className="flex flex-wrap gap-2">
          {payment.proof_image_path ? <a href={`${import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage"}/${payment.proof_image_path}`} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 px-3 py-1 text-sm">Proof</a> : null}
          <button onClick={() => confirm(payment)} className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white">Confirm</button>
          <button onClick={() => reject(payment)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Reject</button>
        </div>
      )}
    />
  );
}
