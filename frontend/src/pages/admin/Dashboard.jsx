import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import { Card, ErrorState, LoadingState, PageHeader, StatCard } from "../../components/ui";
import { toastSuccess } from "../../components/ui";
import RealtimeStatusBadge from "../../components/realtime/RealtimeStatusBadge";
import useOperationsRealtime from "../../hooks/useOperationsRealtime";

export default function Dashboard() {
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ new_count: 0, pending_count: 0, today_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const shopIds = useMemo(() => shops.map((shop) => shop.id), [shops]);

  const handleOrderCreated = useCallback((payload) => {
    setOrders((current) => [
      {
        id: payload.order_id,
        order_number: payload.order_number,
        branch: { name: `Branch #${payload.branch_id}` },
        grand_total: payload.total_amount,
        order_status: payload.status,
      },
      ...current.filter((order) => order.id !== payload.order_id),
    ].slice(0, 6));
    setSummary((current) => ({
      ...current,
      new_count: Number(current.new_count || 0) + 1,
      pending_count: Number(current.pending_count || 0) + 1,
    }));
    toastSuccess(`New order ${payload.order_number}`);
  }, []);

  const handleOrderStatusChanged = useCallback((payload) => {
    setOrders((current) => current.map((order) => (
      order.id === payload.order_id ? { ...order, order_status: payload.new_status } : order
    )));
  }, []);

  const handlePaymentConfirmed = useCallback((payload) => {
    setOrders((current) => current.map((order) => (
      order.id === payload.order_id ? { ...order, payment_status: "paid" } : order
    )));
  }, []);

  const realtimeStatus = useOperationsRealtime({
    restaurantId: shopIds,
    enabled: shopIds.length > 0,
    onOrderCreated: handleOrderCreated,
    onOrderStatusChanged: handleOrderStatusChanged,
    onPaymentConfirmed: handlePaymentConfirmed,
  });

  useEffect(() => {
    Promise.all([api.get("/shops"), api.get("/orders")])
      .then(([shopsResponse, ordersResponse]) => {
        setShops(shopsResponse.data.data.shops);
        setOrders(ordersResponse.data.data.orders.slice(0, 6));
        setSummary(ordersResponse.data.data.summary);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Dashboard could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="Monitor restaurants, live order volume, pending work, and today revenue from one workspace."
      />
      <div className="flex justify-end">
        <RealtimeStatusBadge status={realtimeStatus} />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New orders" value={summary.new_count} note="Orders waiting for action" tone="orange" />
        <StatCard label="Pending orders" value={summary.pending_count} note="Kitchen and payment queue" tone="blue" />
        <StatCard label="Today revenue" value={`${Number(summary.today_revenue || 0).toLocaleString()} KHR`} note="Confirmed sales today" tone="green" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Portfolio</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">Shops</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{shops.length} total</span>
          </div>
          <div className="mt-4 grid gap-3">
            {!shops.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No shops available. Create a shop to start selling from the public menu.</p> : null}
            {shops.map((shop) => (
              <motion.div
                key={shop.id}
                className="rounded-xl border border-slate-200 p-3 transition hover:border-orange-200 hover:bg-orange-50/40"
                whileHover={{ y: -1 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{shop.name}</p>
                    <p className="text-sm text-slate-500">/{shop.slug}</p>
                  </div>
                  <StatusBadge value={shop.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Live queue</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">Recent orders</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{orders.length} shown</span>
          </div>
          <div className="mt-4 grid gap-3">
            {!orders.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No recent orders. Customer orders will appear here when submitted.</p> : null}
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                whileHover={{ y: -1 }}
              >
                <div>
                  <p className="font-semibold text-slate-950">{order.order_number}</p>
                  <p className="text-sm text-slate-500">{order.branch?.name} · {Number(order.grand_total).toLocaleString()} KHR</p>
                </div>
                <StatusBadge value={order.order_status} />
              </motion.div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
