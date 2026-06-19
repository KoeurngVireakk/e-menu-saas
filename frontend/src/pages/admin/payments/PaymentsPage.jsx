import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import api, { getApiErrorMessage } from "../../../api/axios";
import { confirmAction, promptText, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import useLanguage from "../../../i18n/useLanguage";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppPageHeader,
  AppTable,
} from "../../../design-system/components";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import OperationStatusTabs from "../../../design-system/operations/OperationStatusTabs";
import PaymentDetailDrawer from "../../../design-system/operations/PaymentDetailDrawer";
import PaymentStatusBadge from "../../../design-system/operations/PaymentStatusBadge";
import { failedPaymentReason, providerLabel } from "../../../design-system/operations/paymentReview";
import { formatCurrency } from "../../../utils/currency";
import { canManagePayments } from "../../../utils/permissions";

const paymentStatuses = [
  ["all", "All"],
  ["pending", "Pending"],
  ["paid", "Paid"],
  ["confirmed", "Confirmed"],
  ["failed", "Failed"],
  ["rejected", "Rejected"],
  ["refunded", "Refunded"],
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowPaymentActions = canManagePayments(user);
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
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

  const methods = useMemo(() => Array.from(new Set(payments.map((payment) => payment.payment_method).filter(Boolean))), [payments]);
  const statusCounts = useMemo(() => {
    const counts = { all: payments.length };
    payments.forEach((payment) => {
      counts[payment.status] = (counts[payment.status] || 0) + 1;
    });
    return counts;
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments
      .filter((payment) => statusFilter === "all" || payment.status === statusFilter)
      .filter((payment) => methodFilter === "all" || payment.payment_method === methodFilter)
      .filter((payment) => !dateFilter || String(payment.created_at || "").slice(0, 10) === dateFilter)
      .filter((payment) => {
        if (!query) return true;
        return [
          payment.order?.order_number,
          payment.provider_reference,
          payment.transaction_reference,
          payment.order?.customer_name,
          payment.order?.customer_phone,
          payment.payment_method,
        ].filter(Boolean).join(" ").toLowerCase().includes(query);
      });
  }, [dateFilter, methodFilter, payments, search, statusFilter]);

  const confirm = async (payment) => {
    if (!await confirmAction("Confirm payment?", "This payment will be marked as paid.")) return;
    await api.put(`/payments/${payment.id}/confirm`);
    toastSuccess("Payment marked as paid.");
    setSelected((current) => current?.id === payment.id ? { ...current, status: "confirmed" } : current);
    load();
  };

  const reject = async (payment) => {
    const result = await promptText("Reject payment?", "Reason", "Reject");
    if (!result.isConfirmed) return;
    await api.put(`/payments/${payment.id}/reject`, { reason: result.value });
    toastSuccess("Payment was rejected.");
    setSelected((current) => current?.id === payment.id ? { ...current, status: "rejected", failure_reason: result.value } : current);
    load();
  };

  const columns = [
    {
      accessorKey: "order.order_number",
      header: "Order",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.order?.order_number || `Payment #${row.original.id}`}</p>
          <p className="text-xs text-slate-500">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "Time not available"}</p>
        </div>
      ),
    },
    { accessorKey: "payment_method", header: "Method", cell: ({ row }) => row.original.payment_method },
    { accessorKey: "provider", header: "Provider", cell: ({ row }) => providerLabel(row.original) },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency_code) },
    {
      accessorKey: "transaction_reference",
      header: "Reference",
      cell: ({ row }) => <span className="line-clamp-1 max-w-xs text-xs text-slate-600">{row.original.provider_reference || row.original.transaction_reference || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="grid gap-1">
          <PaymentStatusBadge value={row.original.status} />
          {row.original.provider === "bakong_khqr" && row.original.webhook_verified_at ? <span className="text-xs font-semibold text-emerald-600">Verified</span> : null}
          {row.original.failure_reason || failedPaymentReason(row.original) ? <span className="text-xs text-rose-600">{row.original.failure_reason || failedPaymentReason(row.original)}</span> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="Finance operations"
        title={t("pageTitles.paymentsTitle")}
        description={t("pageTitles.paymentsSubtitle")}
        primaryAction={{ children: t("pageTitles.paymentsCta"), onClick: () => load(), iconLeft: <RefreshCw className="h-4 w-4" />, variant: "secondary" }}
      />

      <OperationStatusTabs
        value={statusFilter}
        onChange={setStatusFilter}
        options={paymentStatuses.map(([value, label]) => [value, label, statusCounts[value] || 0])}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search order, reference, customer..."
        filters={(
          <>
            <SelectFilter ariaLabel="Payment method" value={methodFilter} onChange={setMethodFilter} options={[["all", "All methods"], ...methods.map((method) => [method, method])]} />
            <input aria-label="Payment date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </>
        )}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
          setMethodFilter("all");
          setDateFilter("");
        }}
      />

      <AppCard bodyClassName="p-0">
        {loadError ? (
          <AppEmptyState title="Payments could not load" description={loadError} actionLabel="Retry" onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredPayments}
            loading={loading}
            emptyTitle="No payments found"
            emptyDescription="Payment records will appear here after customers submit proof or online payments."
            rowActions={(payment) => (
              <div className="flex flex-wrap justify-end gap-2">
                <AppButton type="button" size="sm" variant="secondary" onClick={() => setSelected(payment)}>View details</AppButton>
                {allowPaymentActions ? <AppButton type="button" size="sm" variant="success" onClick={() => confirm(payment)}>Confirm</AppButton> : null}
                {allowPaymentActions ? <AppButton type="button" size="sm" variant="danger" onClick={() => reject(payment)}>Reject</AppButton> : null}
              </div>
            )}
          />
        )}
      </AppCard>

      <PaymentDetailDrawer
        open={Boolean(selected)}
        payment={selected}
        onClose={() => setSelected(null)}
        onConfirm={confirm}
        onReject={reject}
        allowActions={allowPaymentActions}
      />
    </div>
  );
}

function SelectFilter({ ariaLabel, value, onChange, options }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
    >
      {options.map(([optionValue, label]) => <option key={optionValue || "empty"} value={optionValue}>{label}</option>)}
    </select>
  );
}
