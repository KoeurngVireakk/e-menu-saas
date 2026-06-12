import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function Dashboard() {
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ new_count: 0, pending_count: 0, today_revenue: 0 });

  useEffect(() => {
    api.get("/shops").then((response) => setShops(response.data.data.shops));
    api.get("/orders").then((response) => {
      setOrders(response.data.data.orders.slice(0, 6));
      setSummary(response.data.data.summary);
    });
  }, []);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="New orders" value={summary.new_count} />
        <Metric label="Pending orders" value={summary.pending_count} />
        <Metric label="Today revenue" value={`${Number(summary.today_revenue || 0).toLocaleString()} KHR`} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-950">Shops</h2>
          <div className="mt-4 grid gap-3">
            {shops.map((shop) => (
              <div key={shop.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{shop.name}</p>
                    <p className="text-sm text-slate-500">/{shop.slug}</p>
                  </div>
                  <StatusBadge value={shop.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-950">Recent orders</h2>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-950">{order.order_number}</p>
                  <p className="text-sm text-slate-500">{order.branch?.name} · {Number(order.grand_total).toLocaleString()} KHR</p>
                </div>
                <StatusBadge value={order.order_status} />
              </div>
            ))}
          </div>
        </div>
      </section>
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
