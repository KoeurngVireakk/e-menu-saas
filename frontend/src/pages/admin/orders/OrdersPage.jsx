import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import ReceiptPreview from "../../../components/ReceiptPreview";
import StatusBadge from "../../../components/StatusBadge";
import KitchenTicketPrint from "../../../components/print/KitchenTicketPrint";
import ReceiptPrint from "../../../components/print/ReceiptPrint";
import { confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "../../../utils/currency";
import { canManageInvoices, canManageOrders, canPrintKitchenTicket, canPrintReceipt } from "../../../utils/permissions";

const statuses = ["accepted", "preparing", "ready", "completed", "cancelled"];

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

  const update = async (order, order_status) => {
    if (!await confirmAction("Update order status?", `${order.order_number} will become ${order_status}.`)) return;

    await api.put(`/orders/${order.id}/status`, { order_status });
    toastSuccess("Order status updated.");
    load();
  };

  const viewOrder = async (order) => {
    setSelected(order);
    setReceipt(null);
    setPrintPreview(null);
  };

  const loadReceipt = async (order) => {
    const response = await api.get(`/orders/${order.id}/receipt`);
    setReceipt(response.data.data.receipt);
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
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="New orders" value={summary.new_count} />
        <Metric label="Pending" value={summary.pending_count} />
        <Metric label="Today revenue" value={formatCurrency(summary.today_revenue, "KHR")} />
      </div>
      {selected ? (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">{selected.order_number}</h2>
            <button onClick={() => { setSelected(null); setReceipt(null); setPrintPreview(null); }} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
          </div>
          <p className="mt-2 text-sm text-slate-500">{selected.branch?.name} · {selected.dining_table?.table_name || selected.order_type}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => loadReceipt(selected)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">View receipt</button>
            {allowKitchenPrint ? <button onClick={() => loadPrint(selected, "kitchen")} className="rounded-md border border-orange-300 px-3 py-1 text-sm text-orange-700">Print kitchen ticket</button> : null}
            {allowReceiptPrint ? <button onClick={() => loadPrint(selected, "receipt")} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Print receipt</button> : null}
            {allowInvoiceActions ? <button onClick={() => createInvoice(selected)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">Create invoice</button> : null}
            {receipt ? <button onClick={() => window.print()} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Print receipt</button> : null}
          </div>
          {failedPaymentReason(selected) ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Payment failed: {failedPaymentReason(selected)}
            </div>
          ) : null}
          <div className="mt-4 grid gap-2">
            {selected.items?.map((item) => (
              <div key={item.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span>{item.quantity} x {item.product_name}</span>
                <span>{formatCurrency(item.total_price, selected.currency_code)}</span>
              </div>
            ))}
          </div>
          {receipt ? <div className="mt-4"><ReceiptPreview receipt={receipt} /></div> : null}
          {printPreview ? (
            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 no-print">
                <p className="text-sm font-semibold text-slate-700">Print preview</p>
                <button type="button" onClick={() => window.print()} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">Print now</button>
              </div>
              {printPreview.type === "kitchen" ? <KitchenTicketPrint print={printPreview.payload} /> : <ReceiptPrint print={printPreview.payload} />}
            </div>
          ) : null}
        </div>
      ) : null}
      <DataTable
        columns={[
          { key: "order_number", label: "Order" },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name },
          { key: "grand_total", label: "Total", render: (row) => formatCurrency(row.grand_total, row.currency_code) },
          {
            key: "payment_status",
            label: "Payment",
            render: (row) => (
              <div className="grid gap-1">
                <StatusBadge value={row.payment_status} />
                {failedPaymentReason(row) ? <span className="text-xs text-rose-600">{failedPaymentReason(row)}</span> : null}
              </div>
            ),
          },
          { key: "order_status", label: "Status", render: (row) => <StatusBadge value={row.order_status} /> },
        ]}
        rows={orders}
        loading={loading}
        error={loadError}
        emptyMessage="No orders yet."
        renderActions={(order) => (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => viewOrder(order)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">View</button>
            {allowStatusUpdate ? statuses.map((status) => (
              <button key={status} onClick={() => update(order, status)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">{status}</button>
            )) : null}
          </div>
        )}
      />
    </div>
  );
}

function failedPaymentReason(order) {
  const log = [...(order.payment?.logs || [])].reverse().find((entry) => entry.action === "rejected");

  return log?.payload_json?.reason || "";
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
