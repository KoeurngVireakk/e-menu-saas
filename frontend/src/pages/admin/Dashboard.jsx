import { lazy, Suspense, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChefHat,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  PackagePlus,
  QrCode,
  RefreshCw,
  Settings,
  Store,
  Table2,
} from "lucide-react";
import AutomationInsightCard from "../../components/automation/AutomationInsightCard";
import KitchenQueuePanel from "../../components/dashboard/KitchenQueuePanel";
import NeedsAttentionPanel from "../../components/dashboard/NeedsAttentionPanel";
import PendingPaymentsPanel from "../../components/dashboard/PendingPaymentsPanel";
import QuickActionsGrid from "../../components/dashboard/QuickActionsGrid";
import RecentOrdersPanel from "../../components/dashboard/RecentOrdersPanel";
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
} from "../../design-system/components";
import ChartCard from "../../design-system/charts/ChartCard";
import { pageTransition, staggerContainer, staggerItem } from "../../design-system/motion/variants";
import useOperationsRealtime from "../../hooks/useOperationsRealtime";
import { useOrders } from "../../hooks/useApiQueries";
import { queryKeys } from "../../lib/queryKeys";
import { useShopsQuery } from "../../hooks/useShopsQuery";
import useLanguage from "../../i18n/useLanguage";

const OrderStatusChart = lazy(() => import("../../design-system/charts/OrderStatusChart"));
const SalesLineChart = lazy(() => import("../../design-system/charts/SalesLineChart"));
const TopProductsChart = lazy(() => import("../../design-system/charts/TopProductsChart"));

const kitchenStatuses = new Set(["new", "pending", "accepted", "preparing", "ready", "in_progress"]);
const completedStatuses = new Set(["completed", "served", "closed"]);
const cancelledStatuses = new Set(["cancelled", "canceled", "rejected"]);

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const shopsQuery = useShopsQuery();
  const shops = useMemo(() => shopsQuery.data || [], [shopsQuery.data]);
  const ordersQuery = useOrders();
  const allOrders = useMemo(() => ordersQuery.data?.orders || [], [ordersQuery.data?.orders]);
  const orders = useMemo(() => allOrders.slice(0, 8), [allOrders]);
  const summary = ordersQuery.data?.summary || { new_count: 0, pending_count: 0, today_revenue: 0 };
  const firstLoad = (ordersQuery.isLoading && !ordersQuery.data) || (shopsQuery.isLoading && !shopsQuery.data);
  const ordersError = ordersQuery.error?.userMessage || ordersQuery.error?.response?.data?.message || ordersQuery.error?.message || "";
  const shopsError = shopsQuery.error?.userMessage || shopsQuery.error?.response?.data?.message || shopsQuery.error?.message || "";
  const hasDashboardError = Boolean((ordersError && !ordersQuery.data) || (shopsError && !shopsQuery.data));
  const isRefreshing = (ordersQuery.isFetching || shopsQuery.isFetching) && !firstLoad;
  const shopIds = useMemo(() => shops.map((shop) => shop.id), [shops]);

  const handleOrderCreated = useCallback((payload) => {
    queryClient.setQueryData(queryKeys.orders(), (current = {}) => ({
      ...current,
      orders: [{
        id: payload.order_id,
        order_number: payload.order_number,
        branch: { name: `Branch #${payload.branch_id}` },
        grand_total: payload.total_amount,
        order_status: payload.status,
        payment_status: payload.payment_status,
        created_at: payload.created_at,
      }, ...(current.orders || []).filter((order) => order.id !== payload.order_id)],
      summary: {
        ...(current.summary || {}),
        new_count: Number(current.summary?.new_count || 0) + 1,
        pending_count: Number(current.summary?.pending_count || 0) + 1,
      },
    }));
    toastSuccess(`${t("realtime.newOrder")}: ${payload.order_number}`);
  }, [queryClient, t]);

  const handleOrderStatusChanged = useCallback((payload) => {
    queryClient.setQueryData(queryKeys.orders(), (current = {}) => ({
      ...current,
      orders: (current.orders || []).map((order) => order.id === payload.order_id ? { ...order, order_status: payload.new_status } : order),
    }));
  }, [queryClient]);

  const handlePaymentConfirmed = useCallback((payload) => {
    queryClient.setQueryData(queryKeys.orders(), (current = {}) => ({
      ...current,
      orders: (current.orders || []).map((order) => order.id === payload.order_id ? { ...order, payment_status: "paid" } : order),
    }));
  }, [queryClient]);

  const realtimeStatus = useOperationsRealtime({
    restaurantId: shopIds,
    enabled: shopIds.length > 0,
    onOrderCreated: handleOrderCreated,
    onOrderStatusChanged: handleOrderStatusChanged,
    onPaymentConfirmed: handlePaymentConfirmed,
  });

  const handleRefresh = useCallback(() => {
    ordersQuery.refetch();
    shopsQuery.refetch();
  }, [ordersQuery, shopsQuery]);

  const pendingPaymentOrders = useMemo(() => orders.filter((order) => isPendingPayment(order.payment_status)), [orders]);
  const kitchenQueueOrders = useMemo(() => orders.filter((order) => isKitchenQueue(order.order_status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((order) => completedStatuses.has(String(order.order_status || "").toLowerCase())), [orders]);
  const newOrdersCount = useMemo(() => orders.filter((order) => ["new", "pending"].includes(String(order.order_status || "").toLowerCase())).length, [orders]);
  const pendingPayments = pendingPaymentOrders.length;
  const kitchenQueue = kitchenQueueOrders.length;
  const orderCount = orders.length;
  const averageOrderValue = orderCount ? Math.round(orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0) / orderCount) : 0;
  const locale = language === "km" ? "km-KH" : "en";
  const currency = orders[0]?.currency_code || "KHR";

  const metrics = useMemo(() => [
    {
      title: t("overview.kpis.sales"),
      value: formatMoney(summary.today_revenue || 0, currency),
      description: t("overview.kpis.salesHelp"),
      helperText: t("overview.periods.today"),
      icon: CreditCard,
      tone: "success",
      actionLabel: t("overview.actions.viewReports"),
      actionTo: "/admin/reports",
    },
    {
      title: t("overview.kpis.orders"),
      value: orderCount.toLocaleString(locale),
      description: t("overview.kpis.ordersHelp"),
      helperText: t("overview.kpis.loadedSample"),
      icon: ClipboardList,
      tone: orderCount ? "info" : "neutral",
      actionLabel: t("overview.actions.openOrders"),
      actionTo: "/admin/orders",
    },
    {
      title: t("overview.kpis.averageOrderValue"),
      value: orderCount ? formatMoney(averageOrderValue, currency) : "—",
      description: t("overview.kpis.averageOrderValueHelp"),
      helperText: orderCount ? t("overview.kpis.loadedSample") : t("overview.empty.noDataForPeriod"),
      icon: BarChart3,
      tone: "neutral",
    },
    {
      title: t("overview.kpis.pendingPayments"),
      value: pendingPayments.toLocaleString(locale),
      description: t("overview.kpis.pendingPaymentsHelp"),
      helperText: pendingPayments ? t("overview.needsAttention.reviewBeforeClosing") : t("overview.empty.noPaymentsToReview"),
      icon: CreditCard,
      tone: pendingPayments ? "danger" : "success",
      actionLabel: t("overview.actions.reviewPayments"),
      actionTo: "/admin/payments",
    },
    {
      title: t("overview.kpis.kitchenQueue"),
      value: kitchenQueue.toLocaleString(locale),
      description: t("overview.kpis.kitchenQueueHelp"),
      helperText: kitchenQueue ? t("overview.needsAttention.keepKitchenMoving") : t("overview.empty.noKitchenQueue"),
      icon: ChefHat,
      tone: kitchenQueue ? "warning" : "success",
      actionLabel: t("overview.actions.openKitchen"),
      actionTo: "/admin/kitchen",
    },
    {
      title: t("overview.kpis.completedOrders"),
      value: completedOrders.length.toLocaleString(locale),
      description: t("overview.kpis.completedOrdersHelp"),
      helperText: t("overview.periods.today"),
      icon: CheckCircle2,
      tone: "success",
    },
  ], [averageOrderValue, completedOrders.length, currency, kitchenQueue, locale, orderCount, pendingPayments, summary.today_revenue, t]);

  const orderStatusData = useMemo(() => {
    const counts = orders.reduce((items, order) => {
      const status = order.order_status || t("overview.unknownStatus");
      items[status] = (items[status] || 0) + 1;
      return items;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders, t]);

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
      const name = item.product_name || t("overview.productFallback");
      items[name] = (items[name] || 0) + Number(item.quantity || 0);
      return items;
    }, {});

    return Object.entries(counts).map(([name, quantity]) => ({ name, quantity })).slice(0, 5);
  }, [orders, t]);

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

  const attentionItems = useMemo(() => {
    const items = [];

    if (!shops.length) {
      items.push({
        title: t("overview.needsAttention.noShopTitle"),
        description: t("overview.needsAttention.noShopDescription"),
        href: "/admin/shops",
        actionLabel: t("overview.actions.createShop"),
        tone: "warning",
      });
    }

    if (pendingPayments > 0) {
      items.push({
        title: t("overview.needsAttention.pendingPaymentTitle").replace("{{count}}", pendingPayments.toLocaleString(locale)),
        description: t("overview.needsAttention.pendingPaymentDescription"),
        href: "/admin/payments",
        actionLabel: t("overview.actions.reviewPayments"),
        tone: "danger",
      });
    }

    if (newOrdersCount > 0) {
      items.push({
        title: t("overview.needsAttention.newOrdersTitle").replace("{{count}}", newOrdersCount.toLocaleString(locale)),
        description: t("overview.needsAttention.newOrdersDescription"),
        href: "/admin/orders",
        actionLabel: t("overview.actions.openOrders"),
        tone: "info",
      });
    }

    if (kitchenQueue > 0) {
      items.push({
        title: t("overview.needsAttention.kitchenQueueTitle").replace("{{count}}", kitchenQueue.toLocaleString(locale)),
        description: t("overview.needsAttention.kitchenQueueDescription"),
        href: "/admin/kitchen",
        actionLabel: t("overview.actions.openKitchen"),
        tone: "warning",
      });
    }

    if (!orders.length) {
      items.push({
        title: t("overview.needsAttention.noOrdersTitle"),
        description: t("overview.needsAttention.noOrdersDescription"),
        href: "/admin/tables",
        actionLabel: t("overview.actions.createQrTable"),
        tone: "neutral",
      });
    }

    return items;
  }, [kitchenQueue, locale, newOrdersCount, orders.length, pendingPayments, shops.length, t]);

  const quickActions = useMemo(() => [
    { title: t("overview.actions.addProduct"), description: t("overview.actions.addProductHelp"), to: "/admin/products", feature: "products", icon: PackagePlus },
    { title: t("overview.actions.addCategory"), description: t("overview.actions.addCategoryHelp"), to: "/admin/categories", feature: "categories", icon: BookOpen, iconClassName: "bg-indigo-50 text-indigo-700" },
    { title: t("overview.actions.createQrTable"), description: t("overview.actions.createQrTableHelp"), to: "/admin/tables", feature: "tables", icon: QrCode, iconClassName: "bg-blue-50 text-blue-700" },
    { title: t("overview.actions.openKitchen"), description: t("overview.actions.openKitchenHelp"), to: "/admin/kitchen", feature: "kitchen", icon: ChefHat, iconClassName: "bg-amber-50 text-amber-700" },
    { title: t("overview.actions.reviewPayments"), description: t("overview.actions.reviewPaymentsHelp"), to: "/admin/payments", feature: "payments", icon: CreditCard, iconClassName: "bg-rose-50 text-rose-700" },
    { title: t("overview.actions.viewReports"), description: t("overview.actions.viewReportsHelp"), to: "/admin/reports", feature: "reports", icon: BarChart3, iconClassName: "bg-emerald-50 text-emerald-700" },
    { title: t("overview.actions.shopSettings"), description: t("overview.actions.shopSettingsHelp"), to: "/admin/settings", feature: "settings", icon: Settings, iconClassName: "bg-slate-100 text-slate-700" },
  ], [t]);

  const lastUpdated = useMemo(() => {
    const timestamp = Math.max(ordersQuery.dataUpdatedAt || 0, shopsQuery.dataUpdatedAt || 0);
    if (!timestamp) return "";
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
  }, [locale, ordersQuery.dataUpdatedAt, shopsQuery.dataUpdatedAt]);

  if (firstLoad) return <AppSkeleton variant="page" />;

  if (hasDashboardError) {
    return (
      <div className="grid gap-6">
        <OverviewHeader
          t={t}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          realtimeStatus={realtimeStatus}
        />
        <AppEmptyState
          title={t("overview.errorTitle")}
          description={ordersError || shopsError || t("overview.errorDescription")}
          actionLabel={t("overview.retry")}
          onAction={handleRefresh}
        />
      </div>
    );
  }

  const setupShouldBeProminent = !shops.length || !orders.length;

  return (
    <motion.div className="grid min-w-0 gap-6" variants={pageTransition} initial="hidden" animate="visible">
      <OverviewHeader
        t={t}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        realtimeStatus={realtimeStatus}
      />

      {(ordersError || shopsError) ? (
        <AppCard className="border-amber-200 bg-amber-50/70" bodyClassName="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="khmer-text text-sm font-semibold leading-6 text-amber-900">{ordersError || shopsError}</p>
            <AppButton type="button" variant="secondary" size="sm" onClick={handleRefresh}>{t("overview.retry")}</AppButton>
          </div>
        </AppCard>
      ) : null}

      {setupShouldBeProminent ? <SetupChecklist shops={shops} orders={orders} /> : null}

      <motion.section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" variants={staggerContainer} initial="hidden" animate="visible" aria-label={t("overview.kpiSection")}>
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={staggerItem} className="min-w-0">
            <AppMetricCard {...metric} loading={firstLoad} />
          </motion.div>
        ))}
      </motion.section>

      <NeedsAttentionPanel
        title={t("overview.needsAttention.title")}
        description={t("overview.needsAttention.description")}
        items={attentionItems}
        emptyTitle={t("overview.needsAttention.emptyTitle")}
        emptyDescription={t("overview.needsAttention.emptyDescription")}
      />

      <QuickActionsGrid
        title={t("overview.quickActions.title")}
        description={t("overview.quickActions.description")}
        actions={quickActions}
      />

      <section className="grid gap-4 xl:grid-cols-3" aria-label={t("overview.operationsSnapshot")}>
        <RecentOrdersPanel
          title={t("overview.recentOrders.title")}
          description={t("overview.recentOrders.description")}
          orders={orders.slice(0, 5)}
          emptyTitle={t("overview.empty.noOrdersYet")}
          emptyDescription={t("overview.empty.noOrdersDescription")}
          emptyActionLabel={t("overview.actions.createQrTable")}
          viewAllLabel={t("overview.actions.openOrders")}
          currency={currency}
        />
        <PendingPaymentsPanel
          title={t("overview.pendingPayments.title")}
          description={t("overview.pendingPayments.description")}
          orders={pendingPaymentOrders}
          emptyTitle={t("overview.empty.noPaymentsToReview")}
          emptyDescription={t("overview.empty.noPaymentsDescription")}
          viewAllLabel={t("overview.actions.reviewPayments")}
          currency={currency}
        />
        <KitchenQueuePanel
          title={t("overview.kitchenQueue.title")}
          description={t("overview.kitchenQueue.description")}
          orders={kitchenQueueOrders}
          emptyTitle={t("overview.empty.noKitchenQueue")}
          emptyDescription={t("overview.empty.noKitchenQueueDescription")}
          viewAllLabel={t("overview.actions.openKitchen")}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]" aria-label={t("overview.analyticsPreview")}>
        <ChartCard
          title={t("overview.charts.salesTrend")}
          description={t("overview.charts.salesTrendDescription")}
          action={<AppButton as={Link} to="/admin/reports" variant="secondary" size="sm">{t("overview.actions.viewReports")}</AppButton>}
        >
          <ChartContent empty={!salesTrend.some((item) => item.sales > 0)} emptyText={t("overview.empty.noDataForPeriod")}>
            <Suspense fallback={<ChartLoadingState label={t("overview.loadingChart")} />}>
              <SalesLineChart data={salesTrend} />
            </Suspense>
          </ChartContent>
        </ChartCard>
        <ChartCard
          title={t("overview.charts.orderStatus")}
          description={t("overview.charts.orderStatusDescription")}
          action={<AppButton as={Link} to="/admin/reports" variant="secondary" size="sm">{t("overview.actions.viewReports")}</AppButton>}
        >
          <ChartContent empty={!orderStatusData.length} emptyText={t("overview.empty.noDataForPeriod")}>
            <Suspense fallback={<ChartLoadingState label={t("overview.loadingChart")} />}>
              <OrderStatusChart data={orderStatusData} />
            </Suspense>
          </ChartContent>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard
          title={t("overview.charts.topProducts")}
          description={t("overview.charts.topProductsDescription")}
          action={<AppButton as={Link} to="/admin/reports" variant="secondary" size="sm">{t("overview.actions.viewReports")}</AppButton>}
        >
          <ChartContent empty={!topProducts.length} emptyText={t("overview.empty.noDataForPeriod")}>
            <Suspense fallback={<ChartLoadingState label={t("overview.loadingChart")} />}>
              <TopProductsChart data={topProducts} />
            </Suspense>
          </ChartContent>
        </ChartCard>

        <AppCard
          title={t("overview.analyticsSnapshot.title")}
          description={t("overview.analyticsSnapshot.description")}
          action={<AppButton as={Link} to="/admin/reports" variant="secondary" size="sm">{t("overview.actions.viewReports")}</AppButton>}
          labelled
        >
          <div className="grid gap-3 md:grid-cols-3">
            <SnapshotItem label={t("overview.analyticsSnapshot.topProduct")} value={topProducts[0]?.name || t("overview.empty.noProductSalesYet")} description={topProducts[0] ? t("overview.analyticsSnapshot.topProductHelp").replace("{{count}}", topProducts[0].quantity.toLocaleString(locale)) : t("overview.empty.noDataForPeriod")} />
            <SnapshotItem label={t("overview.analyticsSnapshot.busiestHour")} value={busiestHour ? busiestHour[0] : t("overview.empty.noActivityYet")} description={busiestHour ? t("overview.analyticsSnapshot.busiestHourHelp").replace("{{count}}", busiestHour[1].toLocaleString(locale)) : t("overview.empty.noDataForPeriod")} />
            <SnapshotItem label={t("overview.kpis.pendingPayments")} value={pendingPayments.toLocaleString(locale)} description={pendingPayments ? t("overview.needsAttention.reviewBeforeClosing") : t("overview.empty.noPaymentsToReview")} />
          </div>
        </AppCard>
      </section>

      {!setupShouldBeProminent ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <SetupChecklist shops={shops} orders={orders} />
          <AutomationInsightCard
            title={t("overview.automation.title")}
            description={t("overview.automation.description")}
            severity="info"
            icon={Store}
            actionLabel={t("overview.actions.viewReports")}
            onAction={() => {}}
          />
        </section>
      ) : null}

      <AppCard title={t("overview.shops.title")} description={t("overview.shops.description")} labelled>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {!shops.length ? (
            <AppEmptyState
              title={t("overview.shops.emptyTitle")}
              description={t("overview.shops.emptyDescription")}
              actionLabel={t("overview.actions.createShop")}
              onAction={() => { window.location.href = "/admin/shops"; }}
              checklist={[t("overview.shops.checklistIdentity"), t("overview.shops.checklistBranch"), t("overview.shops.checklistQr")]}
              contained={false}
            />
          ) : null}
          {shops.map((shop) => (
            <Link key={shop.id} to="/admin/shops" className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <Table2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="khmer-heading truncate font-black text-slate-950">{shop.name}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">/{shop.slug}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AppCard>
    </motion.div>
  );
}

function OverviewHeader({ t, isRefreshing, lastUpdated, onRefresh, realtimeStatus }) {
  return (
    <div className="grid gap-3">
      <AppPageHeader
        eyebrow={t("overview.eyebrow")}
        title={t("overview.title")}
        description={t("overview.subtitle")}
        secondaryActions={(
          <>
            <RealtimeStatusBadge status={realtimeStatus} />
            <AppButton as={Link} to="/admin/reports" variant="secondary" iconLeft={<BarChart3 className="h-4 w-4" aria-hidden="true" />}>{t("overview.actions.viewReports")}</AppButton>
          </>
        )}
        primaryAction={{
          children: isRefreshing ? t("overview.refreshing") : t("overview.refresh"),
          onClick: onRefresh,
          variant: "primary",
          loading: isRefreshing,
          iconLeft: <RefreshCw className="h-4 w-4" aria-hidden="true" />,
        }}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500" role={isRefreshing ? "status" : undefined} aria-live="polite">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{t("overview.periods.today")}</span>
        {lastUpdated ? <span>{t("overview.lastUpdated").replace("{{time}}", lastUpdated)}</span> : null}
        {isRefreshing ? <span className="text-blue-700">{t("overview.refreshing")}</span> : null}
      </div>
    </div>
  );
}

function ChartContent({ empty, emptyText, children }) {
  if (empty) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <div>
          <BarChart3 className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
          <p className="khmer-text mt-2 text-sm font-bold leading-6 text-slate-500">{emptyText}</p>
        </div>
      </div>
    );
  }

  return children;
}

function ChartLoadingState({ label }) {
  return (
    <div className="grid h-full content-end gap-3 rounded-2xl bg-slate-50 p-4" role="status" aria-label={label}>
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

function SnapshotItem({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="khmer-label text-xs font-black text-slate-500">{label}</p>
      <p className="khmer-heading mt-2 break-words text-lg font-black leading-7 text-slate-950">{value}</p>
      <p className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function isPendingPayment(status) {
  const normalized = String(status || "").toLowerCase();
  return Boolean(normalized && !["paid", "confirmed", "completed"].includes(normalized));
}

function isKitchenQueue(status) {
  const normalized = String(status || "").toLowerCase();
  return kitchenStatuses.has(normalized) && !completedStatuses.has(normalized) && !cancelledStatuses.has(normalized);
}

function formatMoney(value, currency = "KHR") {
  return `${Number(value || 0).toLocaleString()} ${currency}`;
}
