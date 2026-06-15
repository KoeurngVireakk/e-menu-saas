import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import api, { getApiErrorMessage } from "../../../api/axios";
import ReceiptPreview from "../../../components/ReceiptPreview";
import KitchenTicketPrint from "../../../components/print/KitchenTicketPrint";
import ReceiptPrint from "../../../components/print/ReceiptPrint";
import { confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
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
  ["all", "All"],
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export default function OrdersPage() {
  const { user } = useAuth();
  const allowStatusUpdate = canManageOrders(user);
  const allowInvoiceActions = canManageInvoices(user);
  const allowKitchenPrint = canPrintKitchenTicket(user);
  const allowReceiptPrint = canPrintReceipt(user);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ new_count: 0, pending_count: 0, today_revenue: 0 });
  const [selected, setSelected] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [printPreview, setPrintPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");

    return api
      .get("/orders")
      .then((response) => {
        setOrders(response.data.data.orders);
        setSummary(response.data.data.summary);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load orders.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(load, 0);
    const refreshTimer = window.setInterval(load, 10000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(refreshTimer);
    };
  }, [load]);

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
      if (!await confirmAction("Cancel order?", `${order.order_number} will be cancelled. This action should only be used when the restaurant cannot fulfill the order.`)) return;
    } else if (!await confirmAction("Update order status?", `${order.order_number} will become ${order_status}.`)) {
      return;
    }

    await api.put(`/orders/${order.id}/status`, { order_status });
    toastSuccess("Order status updated.");
    setSelected((current) => current?.id === order.id ? { ...current, order_status } : current);
    load();
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
    load();
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
      header: "Order",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-950">{row.original.order_number}</p>
          <p className="text-xs text-slate-500">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "Time not available"}</p>
        </div>
      ),
    },
    {
      accessorKey: "branch.name",
      header: "Table / Branch",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-slate-800">{row.original.dining_table?.table_name || row.original.order_type}</p>
          <p className="text-xs text-slate-500">{row.original.branch?.name || "Branch"}</p>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-800">{row.original.customer_name || "Guest"}</p>
          <p className="text-xs text-slate-500">{row.original.customer_phone || "-"}</p>
        </div>
      ),
    },
    { accessorKey: "items", header: "Items", cell: ({ row }) => `${row.original.items?.length || 0} lines` },
    { accessorKey: "grand_total", header: "Total", cell: ({ row }) => formatCurrency(row.original.grand_total, row.original.currency_code) },
    { accessorKey: "payment_status", header: "Payment", cell: ({ row }) => <PaymentStatusBadge value={row.original.payment_status} /> },
    { accessorKey: "order_status", header: "Status", cell: ({ row }) => <OrderStatusBadge value={row.original.order_status} /> },
  ];

  return (
    <div className="grid gap-5">
      <AppPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Track live restaurant orders, update fulfillment status, and open receipts or kitchen tickets from one operations workspace."
        primaryAction={{ children: "Refresh", onClick: () => load(), iconLeft: <RefreshCw className="h-4 w-4" />, variant: "secondary" }}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AppMetricCard title="New orders" value={summary.new_count} description="Orders waiting for action" />
        <AppMetricCard title="Pending" value={summary.pending_count} description="Kitchen and payment queue" />
        <AppMetricCard title="Today revenue" value={formatCurrency(summary.today_revenue, "KHR")} description="Confirmed sales today" />
      </section>

      <OperationStatusTabs
        value={statusFilter}
        onChange={setStatusFilter}
        options={orderStatuses.map(([value, label]) => [value, label, statusCounts[value] || 0])}
      />

      <CrudToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search order, table, customer, phone..."
        filters={(
          <>
            <SelectFilter ariaLabel="Branch" value={branchFilter} onChange={setBranchFilter} options={[["all", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
            <SelectFilter ariaLabel="Payment status" value={paymentFilter} onChange={setPaymentFilter} options={[["all", "All payments"], ["unpaid", "Unpaid"], ["pending", "Pending"], ["paid", "Paid"], ["failed", "Failed"]]} />
            <input aria-label="Order date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
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
          <AppEmptyState title="Orders could not load" description={loadError} actionLabel="Retry" onAction={load} />
        ) : (
          <AppTable
            columns={columns}
            data={filteredOrders}
            loading={loading}
            emptyTitle="No orders found"
            emptyDescription="New customer orders will appear here. Clear filters if you expected results."
            rowActions={(order) => (
              <div className="flex flex-wrap justify-end gap-2">
                <AppButton type="button" size="sm" variant="secondary" onClick={() => viewOrder(order)}>View details</AppButton>
                {allowStatusUpdate && order.order_status === "pending" ? <AppButton type="button" size="sm" onClick={() => update(order, "accepted")}>Accept</AppButton> : null}
                {allowStatusUpdate && ["pending", "accepted"].includes(order.order_status) ? <AppButton type="button" size="sm" variant="outline" onClick={() => update(order, "preparing")}>Preparing</AppButton> : null}
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
