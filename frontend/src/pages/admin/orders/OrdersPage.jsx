import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import api from "../../../api/axios";
import ReceiptPreview from "../../../components/ReceiptPreview";
import KitchenTicketPrint from "../../../components/print/KitchenTicketPrint";
import ReceiptPrint from "../../../components/print/ReceiptPrint";
import { confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useOrders } from "../../../hooks/useApiQueries";
import { queryKeys } from "../../../lib/queryKeys";
import useLanguage from "../../../i18n/useLanguage";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppMetricCard,
  AppPageHeader,
  AppTable,
} from "../../../design-system/components";
import CrudToolbar from "../../../design-system/crud/CrudToolbar";
import OperationStatusTabs from "../../../design-system/operations/OperationStatusTabs";
import OrderDetailDrawer from "../../../design-system/operations/OrderDetailDrawer";
import OrderStatusBadge from "../../../design-system/operations/OrderStatusBadge";
import PaymentStatusBadge from "../../../design-system/operations/PaymentStatusBadge";
import { formatCurrency } from "../../../utils/currency";
import { canManageInvoices, canManageOrders, canPrintKitchenTicket, canPrintReceipt } from "../../../utils/permissions";

const orderStatuses = [
  "all",
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowStatusUpdate = canManageOrders(user);
  const allowInvoiceActions = canManageInvoices(user);
  const allowKitchenPrint = canPrintKitchenTicket(user);
  const allowReceiptPrint = canPrintReceipt(user);
  const ordersQuery = useOrders({}, { refetchInterval: 10_000 });
  const orders = useMemo(() => ordersQuery.data?.orders || [], [ordersQuery.data?.orders]);
  const summary = ordersQuery.data?.summary || { new_count: 0, pending_count: 0, today_revenue: 0 };
  const [selected, setSelected] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [printPreview, setPrintPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const loading = ordersQuery.isLoading;
  const loadError = ordersQuery.error?.userMessage || ordersQuery.error?.response?.data?.message || "";
  const load = ordersQuery.refetch;
  const tr = (key, fallback) => t(`operations.${key}`, fallback);
  const statusLabel = (status) => t(`operations.statusLabels.${status}`, status);
  const interpolate = (key, values) => Object.entries(values).reduce(
    (copy, [name, value]) => copy.replace(`{{${name}}}`, value),
    tr(key),
  );

  const branches = useMemo(() => uniqueOptions(orders.map((order) => order.branch).filter(Boolean)), [orders]);
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders
      .filter((order) => statusFilter === "all" || order.order_status === statusFilter)
      .filter((order) => branchFilter === "all" || String(order.branch?.id || order.branch_id || "") === String(branchFilter))
      .filter((order) => paymentFilter === "all" || order.payment_status === paymentFilter)
      .filter((order) => !dateFilter || String(order.created_at || "").slice(0, 10) === dateFilter)
      .filter((order) => {
        if (!query) return true;
        return [
          order.order_number,
          order.dining_table?.table_name,
          order.customer_name,
          order.customer_phone,
          order.branch?.name,
        ].filter(Boolean).join(" ").toLowerCase().includes(query);
      });
  }, [branchFilter, dateFilter, orders, paymentFilter, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    orders.forEach((order) => {
      counts[order.order_status] = (counts[order.order_status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const update = async (order, order_status) => {
    if (order_status === "cancelled") {
      if (!await confirmAction(tr("cancelOrderTitle"), interpolate("cancelOrderHelp", { order: order.order_number }))) return;
    } else if (!await confirmAction(tr("updateOrderTitle"), interpolate("updateOrderHelp", { order: order.order_number, status: statusLabel(order_status) }))) {
      return;
    }

    await api.put(`/orders/${order.id}/status`, { order_status });
    toastSuccess(tr("orderStatusUpdated"));
    setSelected((current) => current?.id === order.id ? { ...current, order_status } : current);
    await queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
  };

  const viewOrder = (order) => {
    setSelected(order);
    setReceipt(null);
    setPrintPreview(null);
  };

  const loadReceipt = async (order) => {
    const response = await api.get(`/orders/${order.id}/receipt`);
    setReceipt(response.data.data.receipt);
    setPrintPreview(null);
  };

  const createInvoice = async (order) => {
    const response = await api.post(`/orders/${order.id}/invoice`);
    toastSuccess(`Invoice ${response.data.data.invoice.invoice_number} ready.`);
    await queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
  };

  const loadPrint = async (order, type) => {
    const endpoint = type === "kitchen" ? `/orders/${order.id}/kitchen-ticket` : `/orders/${order.id}/receipt-print`;
    const response = await api.get(endpoint);
    setPrintPreview({ type, payload: response.data.data.print });
    setReceipt(null);
  };

  const columns = [
    {
      accessorKey: "order_number",
      header: tr("order"),
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.order_number}</p>
          <p className="text-xs text-slate-500">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : tr("timeNotAvailable")}</p>
        </div>
      ),
    },
    {
      accessorKey: "branch.name",
      header: `${tr("table")} / ${tr("branch")}`,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-slate-800">{row.original.dining_table?.table_name || row.original.order_type}</p>
          <p className="text-xs text-slate-500">{row.original.branch?.name || tr("branch")}</p>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: tr("customer"),
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-800">{row.original.customer_name || tr("guest")}</p>
          <p className="text-xs text-slate-500">{row.original.customer_phone || "-"}</p>
        </div>
      ),
    },
    { accessorKey: "items", header: tr("items"), cell: ({ row }) => `${row.original.items?.length || 0} ${tr("itemLines")}` },
    { accessorKey: "grand_total", header: tr("total"), cell: ({ row }) => formatCurrency(row.original.grand_total, row.original.currency_code) },
    { accessorKey: "payment_status", header: tr("payment"), cell: ({ row }) => <PaymentStatusBadge value={row.original.payment_status} /> },
    { accessorKey: "order_status", header: tr("status"), cell: ({ row }) => <OrderStatusBadge value={row.original.order_status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow={tr("workflow")}
        title={t("pageTitles.ordersTitle")}
        description={t("pageTitles.ordersSubtitle")}
        primaryAction={{ children: t("pageTitles.ordersCta"), onClick: () => load(), iconLeft: <RefreshCw className="h-4 w-4" />, variant: "secondary" }}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AppMetricCard title={tr("newOrders")} value={summary.new_count} description={tr("newOrdersHelp")} />
        <AppMetricCard title={tr("pendingOrders")} value={summary.pending_count} description={tr("pendingOrdersHelp")} />
        <AppMetricCard title={tr("todayRevenue")} value={formatCurrency(summary.today_revenue, "KHR")} description={tr("todayRevenueHelp")} />
      </section>

      <OperationStatusTabs
        value={statusFilter}
        onChange={setStatusFilter}
        options={orderStatuses.map((value) => [value, statusLabel(value), statusCounts[value] || 0])}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={tr("searchOrdersPlaceholder")}
        filters={(
          <>
            <SelectFilter ariaLabel={tr("branch")} value={branchFilter} onChange={setBranchFilter} options={[["all", tr("allBranches")], ...branches.map((branch) => [branch.id, branch.name])]} />
            <SelectFilter ariaLabel={tr("paymentStatus")} value={paymentFilter} onChange={setPaymentFilter} options={[["all", tr("allPayments")], ["unpaid", statusLabel("unpaid")], ["pending", statusLabel("pending")], ["paid", statusLabel("paid")], ["failed", statusLabel("failed")]]} />
            <input aria-label={tr("orderDate")} type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </>
        )}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
          setBranchFilter("all");
          setPaymentFilter("all");
          setDateFilter("");
        }}
      />

      <AppCard bodyClassName="p-0">
        {loadError ? (
          <AppEmptyState title={tr("ordersCouldNotLoad")} description={loadError} actionLabel={tr("retry")} onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredOrders}
            loading={loading}
            emptyTitle={tr("noOrdersFound")}
            emptyDescription={tr("noOrdersFoundHelp")}
            rowActions={(order) => (
              <div className="flex flex-wrap justify-end gap-2">
                <AppButton type="button" size="sm" variant="secondary" onClick={() => viewOrder(order)}>{tr("viewDetails")}</AppButton>
                {allowStatusUpdate && order.order_status === "pending" ? <AppButton type="button" size="sm" onClick={() => update(order, "accepted")}>{tr("accept")}</AppButton> : null}
                {allowStatusUpdate && ["pending", "accepted"].includes(order.order_status) ? <AppButton type="button" size="sm" variant="outline" onClick={() => update(order, "preparing")}>{tr("preparing")}</AppButton> : null}
              </div>
            )}
          />
        )}
      </AppCard>

      <OrderDetailDrawer
        open={Boolean(selected)}
        order={selected}
        onClose={() => { setSelected(null); setReceipt(null); setPrintPreview(null); }}
        onStatus={update}
        onReceipt={loadReceipt}
        onPrint={loadPrint}
        onInvoice={createInvoice}
        allowStatusUpdate={allowStatusUpdate}
        allowKitchenPrint={allowKitchenPrint}
        allowReceiptPrint={allowReceiptPrint}
        allowInvoiceActions={allowInvoiceActions}
        receipt={receipt}
        printPreview={printPreview}
        receiptPreview={receipt ? <ReceiptPreview receipt={receipt} /> : printPreview?.type === "receipt" ? <ReceiptPrint print={printPreview.payload} /> : null}
        kitchenPrintPreview={printPreview?.type === "kitchen" ? <KitchenTicketPrint print={printPreview.payload} /> : null}
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

function uniqueOptions(items) {
  const map = new Map();
  items.forEach((item) => {
    if (item?.id && !map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
}
