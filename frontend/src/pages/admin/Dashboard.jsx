import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Building2, ChefHat, ClipboardList, CreditCard, PackagePlus, QrCode, Store, Utensils } from "lucide-react";
import api from "../../api/axios";
import AutomationInsightCard from "../../components/automation/AutomationInsightCard";
import SetupChecklist from "../../components/onboarding/SetupChecklist";
import RealtimeStatusBadge from "../../components/realtime/RealtimeStatusBadge";
import { toastSuccess } from "../../components/ui";
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
import { pageTransition, staggerContainer, staggerItem } from "../../design-system/motion/variants";
import useOperationsRealtime from "../../hooks/useOperationsRealtime";
import { useShopsQuery } from "../../hooks/useShopsQuery";
import useLanguage from "../../i18n/useLanguage";

const OrderStatusChart = lazy(() => import("../../design-system/charts/OrderStatusChart"));
const SalesLineChart = lazy(() => import("../../design-system/charts/SalesLineChart"));
const TopProductsChart = lazy(() => import("../../design-system/charts/TopProductsChart"));

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: shops = [] } = useShopsQuery();
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
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.get("/orders")
        .then((ordersResponse) => {
          setOrders(ordersResponse.data.data.orders.slice(0, 8));
          setSummary(ordersResponse.data.data.summary);
        })
        .catch((requestError) => setError(requestError.response?.data?.message || "Dashboard could not be loaded."))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
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

  const busiestHour = useMemo(() => {
    const counts = orders.reduce((items, order) => {
      const hour = order.created_at ? new Date(order.created_at).getHours() : null;
      if (hour === null || Number.isNaN(hour)) return items;
      const label = `${String(hour).padStart(2, "0")}:00`;
      items[label] = (items[label] || 0) + 1;
      return items;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || null;
  }, [orders]);

  const pendingPayments = useMemo(() => (
    orders.filter((order) => order.payment_status && order.payment_status !== "paid").length
  ), [orders]);

  const attentionItems = useMemo(() => {
    const unpaidOrders = orders.filter((order) => order.payment_status && order.payment_status !== "paid").length;
    const pendingOrders = Number(summary.pending_count || 0);
    const items = [];

    if (!shops.length) {
      items.push({
        title: "Create your shop profile",
        description: "A shop profile is required before QR menus, branches, products, and orders can work.",
        to: "/admin/shops",
        action: "Create shop",
        tone: "warning",
      });
    }

    if (pendingOrders > 0) {
      items.push({
        title: `${pendingOrders} order${pendingOrders === 1 ? "" : "s"} need attention`,
        description: "Open the orders or kitchen queue and move work through the next clear status.",
        to: "/admin/orders",
        action: "View orders",
        tone: "info",
      });
    }

    if (unpaidOrders > 0) {
      items.push({
        title: `${unpaidOrders} payment${unpaidOrders === 1 ? "" : "s"} pending`,
        description: "Review proof uploads or confirm cash/manual payments before closing the shift.",
        to: "/admin/payments",
        action: "Review payments",
        tone: "danger",
      });
    }

    if (!orders.length) {
      items.push({
        title: "No customer orders yet",
        description: "Orders will appear here when customers scan your QR menu and submit cart items.",
        to: "/admin/tables",
        action: "Create table QR",
        tone: "neutral",
      });
    }

    return items;
  }, [orders, shops.length, summary.pending_count]);

  if (loading) return <AppSkeleton variant="page" />;
  if (error) return <AppEmptyState title="Dashboard unavailable" description={error} />;

  return (
    <motion.div className="grid gap-6" variants={pageTransition} initial="hidden" animate="visible">
      <AppPageHeader
        eyebrow="Operations"
        title={t("pageTitles.dashboardTitle")}
        description={t("pageTitles.dashboardSubtitle")}
        secondaryActions={<RealtimeStatusBadge status={realtimeStatus} />}
      />

      <motion.section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={staggerContainer} initial="hidden" animate="visible">
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={staggerItem}>
            <AppMetricCard {...metric} />
          </motion.div>
        ))}
      </motion.section>

      <SetupChecklist shops={shops} orders={orders} />

      <AppCard title="Needs attention" description="What needs action now, based on loaded shop and order data.">
        <div className="grid gap-3 lg:grid-cols-2">
          {attentionItems.map((item) => (
            <Link key={item.title} to={item.to} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                item.tone === "danger" ? "bg-rose-50 text-rose-600" : item.tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
              }`}>
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-black text-slate-950">{item.title}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</span>
                <span className="mt-3 inline-flex text-sm font-black text-blue-700">{item.action}</span>
              </span>
            </Link>
          ))}
        </div>
      </AppCard>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Sales trend" description="Confirmed order value by hour for the current dashboard sample.">
          <Suspense fallback={<ChartLoadingState />}>
            <SalesLineChart data={salesTrend} />
          </Suspense>
        </ChartCard>
        <ChartCard title="Order status" description="Live-ready operational status mix.">
          <Suspense fallback={<ChartLoadingState />}>
            <OrderStatusChart data={orderStatusData} />
          </Suspense>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Top products" description="Products appearing most often in loaded orders.">
          <Suspense fallback={<ChartLoadingState />}>
            <TopProductsChart data={topProducts} />
          </Suspense>
        </ChartCard>

        <AppCard title="Recent orders" description="Live updates appear here without a page refresh.">
          <div className="grid gap-3">
            {!orders.length ? (
              <AppEmptyState
                title="No orders yet"
                description="Orders will appear here when customers scan table QR codes and submit their cart."
                actionLabel="View table QR codes"
                onAction={() => { window.location.href = "/admin/tables"; }}
                checklist={["Create at least one product", "Generate a table QR code", "Submit a test order from the public menu"]}
                contained={false}
              />
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

      <AppCard
        title="Analytics snapshot"
        description="A compact read of loaded order data. Open reports for full tenant-scoped analytics."
        action={<AppButton as={Link} to="/admin/reports" variant="secondary">View reports</AppButton>}
      >
        <div className="grid gap-3 p-1 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase text-slate-500">Top product</p>
            <p className="mt-2 text-lg font-black text-slate-950">{topProducts[0]?.name || "No product sales yet"}</p>
            <p className="mt-1 text-sm text-slate-500">{topProducts[0] ? `${topProducts[0].quantity} items in loaded orders` : "Completed product data appears after orders."}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase text-slate-500">Busiest hour</p>
            <p className="mt-2 text-lg font-black text-slate-950">{busiestHour ? busiestHour[0] : "No activity yet"}</p>
            <p className="mt-1 text-sm text-slate-500">{busiestHour ? `${busiestHour[1]} orders in loaded sample` : "Orders will reveal hourly activity."}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase text-slate-500">Pending payments</p>
            <p className="mt-2 text-lg font-black text-slate-950">{pendingPayments}</p>
            <p className="mt-1 text-sm text-slate-500">{pendingPayments ? "Review payments before closing." : "No pending payments in loaded orders."}</p>
          </div>
        </div>
      </AppCard>

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
          {!shops.length ? (
            <AppEmptyState
              title="Create your first shop"
              description="Your shop profile controls the QR menu identity, branch setup, and customer ordering context."
              actionLabel="Create shop"
              onAction={() => { window.location.href = "/admin/shops"; }}
              checklist={["Add shop name and logo", "Create a branch", "Add products and table QR codes"]}
              contained={false}
            />
          ) : null}
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

function ChartLoadingState() {
  return (
    <div className="grid h-full content-end gap-3 rounded-2xl bg-slate-50 p-4" aria-label="Loading chart">
      <div className="flex h-32 items-end gap-2">
        {[52, 70, 44, 82, 64, 76].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="flex-1 rounded-t-xl bg-slate-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="h-3 w-2/3 rounded-full bg-slate-200" />
    </div>
  );
}
