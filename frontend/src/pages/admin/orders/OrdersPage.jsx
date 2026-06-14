import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { confirmAction, toastSuccess } from "../../../components/ui";

const statuses = ["accepted", "preparing", "ready", "completed", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ new_count: 0, pending_count: 0, today_revenue: 0 });
  const [selected, setSelected] = useState(null);
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
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load orders."))
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

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="New orders" value={summary.new_count} />
        <Metric label="Pending" value={summary.pending_count} />
        <Metric label="Today revenue" value={`${Number(summary.today_revenue || 0).toLocaleString()} KHR`} />
      </div>
      {selected ? (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">{selected.order_number}</h2>
            <button onClick={() => setSelected(null)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
          </div>
          <p className="mt-2 text-sm text-slate-500">{selected.branch?.name} · {selected.dining_table?.table_name || selected.order_type}</p>
          <div className="mt-4 grid gap-2">
            {selected.items?.map((item) => (
              <div key={item.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span>{item.quantity} x {item.product_name}</span>
                <span>{Number(item.total_price).toLocaleString()} KHR</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <DataTable
        columns={[
          { key: "order_number", label: "Order" },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name },
          { key: "grand_total", label: "Total", render: (row) => `${Number(row.grand_total).toLocaleString()} KHR` },
          { key: "payment_status", label: "Payment", render: (row) => <StatusBadge value={row.payment_status} /> },
          { key: "order_status", label: "Status", render: (row) => <StatusBadge value={row.order_status} /> },
        ]}
        rows={orders}
        loading={loading}
        error={loadError}
        emptyMessage="No orders yet."
        renderActions={(order) => (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelected(order)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">View</button>
            {statuses.map((status) => (
              <button key={status} onClick={() => update(order, status)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">{status}</button>
            ))}
          </div>
        )}
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
