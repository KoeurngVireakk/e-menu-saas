import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";

const statuses = ["accepted", "preparing", "ready", "completed", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ new_count: 0, pending_count: 0, today_revenue: 0 });
  const [selected, setSelected] = useState(null);

  const load = () => api.get("/orders").then((response) => {
    setOrders(response.data.data.orders);
    setSummary(response.data.data.summary);
  });

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const update = async (order, order_status) => {
    const result = await Swal.fire({
      title: "Update order status?",
      text: `${order.order_number} will become ${order_status}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Update",
    });

    if (!result.isConfirmed) return;

    await api.put(`/orders/${order.id}/status`, { order_status });
    Swal.fire("Updated", "Order status updated.", "success");
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
