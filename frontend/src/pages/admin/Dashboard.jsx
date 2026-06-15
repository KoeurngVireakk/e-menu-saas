import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ChefHat, ClipboardList, CreditCard, PackagePlus, QrCode, Store, Utensils } from "lucide-react";
import api from "../../api/axios";
import AutomationInsightCard from "../../components/automation/AutomationInsightCard";
import RealtimeStatusBadge from "../../components/realtime/RealtimeStatusBadge";
import { toastSuccess } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppMetricCard,
  AppPageHeader,
  AppSkeleton,
  AppStatusBadge,
} from "../../design-system/components";
import ChartCard from "../../design-system/charts/ChartCard";
import OrderStatusChart from "../../design-system/charts/OrderStatusChart";
import SalesLineChart from "../../design-system/charts/SalesLineChart";
import TopProductsChart from "../../design-system/charts/TopProductsChart";
import { pageTransition, staggerContainer, staggerItem } from "../../design-system/motion/variants";
import useOperationsRealtime from "../../hooks/useOperationsRealtime";

export default function Dashboard() {
  const { user } = useAuth();
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
        payment_status: payload.payment_status,
        created_at: payload.created_at,
      },
      ...current.filter((order) => order.id !== payload.order_id),
    ].slice(0, 8));
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
        setOrders(ordersResponse.data.data.orders.slice(0, 8));
        setSummary(ordersResponse.data.data.summary);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Dashboard could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const completed = orders.filter((order) => order.order_status === "completed").length;

    return [
      {
        title: "Today sales",
        value: `${Number(summary.today_revenue || 0).toLocaleString()} KHR`,
        description: "Confirmed revenue",
        icon: CreditCard,
      },
      {
        title: "Today orders",
        value: orders.length,
        description: "Recent operational queue",
        icon: ClipboardList,
      },
      {
        title: "Pending orders",
        value: summary.pending_count || 0,
        description: "Kitchen and payment work",
        icon: ChefHat,
      },
      {
        title: "Completed",
        value: completed,
        description: "Served or closed orders",
        icon: Utensils,
      },
    ];
  }, [orders, summary.pending_count, summary.today_revenue]);

  const orderStatusData = useMemo(() => {
    const counts = orders.reduce((items, order) => {
      items[order.order_status] = (items[order.order_status] || 0) + 1;
      return items;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const salesTrend = useMemo(() => {
    const buckets = orders.reduce((items, order) => {
      const hour = order.created_at ? new Date(order.created_at).getHours() : new Date().getHours();
      const label = `${String(hour).padStart(2, "0")}:00`;
      items[label] = (items[label] || 0) + Number(order.payment_status === "paid" ? order.grand_total || 0 : 0);
      return items;
    }, {});

    return Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).map(([label, sales]) => ({ label, sales }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = orders.flatMap((order) => order.items || []).reduce((items, item) => {
      const name = item.product_name || "Product";
      items[name] = (items[name] || 0) + Number(item.quantity || 0);
      return items;
    }, {});

    return Object.entries(counts).map(([name, quantity]) => ({ name, quantity })).slice(0, 5);
  }, [orders]);

  if (loading) return <AppSkeleton variant="page" />;
  if (error) return <AppEmptyState title="Dashboard unavailable" description={error} />;

  return (
    <motion.div className="grid gap-6" variants={pageTransition} initial="hidden" animate="visible">
      <AppPageHeader
        eyebrow="Operations"
        title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        description="Monitor live order activity, shop performance, kitchen work, and payment operations from one clean workspace."
        secondaryActions={<RealtimeStatusBadge status={realtimeStatus} />}
      />

      <motion.section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={staggerContainer} initial="hidden" animate="visible">
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={staggerItem}>
            <AppMetricCard {...metric} />
          </motion.div>
        ))}
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Sales trend" description="Confirmed order value by hour for the current dashboard sample.">
          <SalesLineChart data={salesTrend} />
        </ChartCard>
        <ChartCard title="Order status" description="Live-ready operational status mix.">
          <OrderStatusChart data={orderStatusData} />
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Top products" description="Products appearing most often in loaded orders.">
          <TopProductsChart data={topProducts} />
        </ChartCard>

        <AppCard title="Recent orders" description="Live updates appear here without a page refresh.">
          <div className="grid gap-3">
            {!orders.length ? (
              <AppEmptyState title="No orders yet" description="Customer orders will appear here when submitted." />
            ) : orders.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders"
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="min-w-0">
                  <p className="font-black text-slate-950">{order.order_number}</p>
                  <p className="truncate text-sm text-slate-500">{order.branch?.name || "Branch"} - {Number(order.grand_total || 0).toLocaleString()} KHR</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <AppStatusBadge value={order.order_status} />
                  <AppStatusBadge value={order.payment_status} />
                </div>
              </Link>
            ))}
          </div>
        </AppCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <AppCard title="Quick actions" description="Common tasks for restaurant operators and staff.">
          <div className="grid gap-3 sm:grid-cols-2">
            <AppButton as={Link} to="/admin/products" variant="outline" iconLeft={<PackagePlus className="h-4 w-4" />}>Add product</AppButton>
            <AppButton as={Link} to="/admin/branches" variant="outline" iconLeft={<Building2 className="h-4 w-4" />}>Create branch</AppButton>
            <AppButton as={Link} to="/admin/orders" variant="outline" iconLeft={<ClipboardList className="h-4 w-4" />}>View orders</AppButton>
            <AppButton as={Link} to="/admin/tables" variant="outline" iconLeft={<QrCode className="h-4 w-4" />}>Generate table QR</AppButton>
          </div>
        </AppCard>

        <AutomationInsightCard
          title="Automation-ready insight"
          description="This area is prepared for future reminders like daily closing alerts, low-stock signals, peak-hour insights, and slow-selling product suggestions."
          severity="info"
          icon={Store}
          actionLabel="View reports"
          onAction={() => {}}
        />
      </section>

      <AppCard title="Shops" description="Restaurant portfolio available to this account.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {!shops.length ? <AppEmptyState title="No shops available" description="Create a shop to start selling from the public menu." /> : null}
          {shops.map((shop) => (
            <Link key={shop.id} to="/admin/shops" className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{shop.name}</p>
                  <p className="mt-1 text-sm text-slate-500">/{shop.slug}</p>
                </div>
                <AppStatusBadge value={shop.status} />
              </div>
            </Link>
          ))}
        </div>
      </AppCard>
    </motion.div>
  );
}
