import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import api, { getApiErrorMessage } from "../../../api/axios";
import { ErrorState, Input, LoadingState, Select } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { AppButton, AppCard, AppEmptyState, AppMetricCard, AppPageHeader } from "../../../design-system/components";
import ReportChartCard from "../../../design-system/charts/ReportChartCard";
import { useLanguage } from "../../../i18n";
import { exportReportSummary, getAnalyticsOverview } from "../../../services/reportService";
import { formatCurrency } from "../../../utils/currency";
import { canExportReports } from "../../../utils/permissions";

const SalesTrendChart = lazy(() => import("../../../design-system/charts/SalesTrendChart"));
const OrderStatusBreakdownChart = lazy(() => import("../../../design-system/charts/OrderStatusBreakdownChart"));
const TopProductsChart = lazy(() => import("../../../design-system/charts/TopProductsChart"));
const PaymentMethodsChart = lazy(() => import("../../../design-system/charts/PaymentMethodsChart"));
const HourlyActivityChart = lazy(() => import("../../../design-system/charts/HourlyActivityChart"));
const BranchPerformanceTable = lazy(() => import("../../../design-system/charts/BranchPerformanceTable"));

const initialFilters = {
  shop_id: "",
  branch_id: "",
  period: "last_7_days",
  date_from: "",
  date_to: "",
  order_status: "",
  payment_status: "",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const allowExport = canExportReports(user);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState({ shopId: "", items: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      const loaded = response.data.data.shops || [];
      setShops(loaded);
      setFilters((current) => ({ ...current, shop_id: loaded[0]?.id || "" }));
    }).catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load shops.")));
  }, []);

  useEffect(() => {
    if (!filters.shop_id) {
      return;
    }

    let ignore = false;
    api.get(`/shops/${filters.shop_id}/branches`).then((response) => {
      if (ignore) return;
      const loaded = response.data.data.branches || [];
      setBranches({ shopId: filters.shop_id, items: loaded });
      setFilters((current) => ({
        ...current,
        branch_id: user?.role === "cashier" ? loaded[0]?.id || "" : current.branch_id,
      }));
    });

    return () => {
      ignore = true;
    };
  }, [filters.shop_id, user?.role]);

  const load = useCallback(() => {
    if (!filters.shop_id || (user?.role === "cashier" && !filters.branch_id)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    getAnalyticsOverview(filters)
      .then((payload) => setReports(payload.reports))
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load reports.")))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [filters.shop_id, shops]);
  const branchOptions = String(branches.shopId) === String(filters.shop_id) ? branches.items : [];
  const summary = reports?.summary;
  const currency = summary?.currency_code || selectedShop?.currency_code || "KHR";
  const hasData = Boolean(summary?.order_count || summary?.total_sales || reports?.top_products?.length);
  const topProductRows = useMemo(() => (reports?.top_products || []).map((product) => ({
    name: product.product_name,
    quantity: product.quantity_sold,
  })), [reports?.top_products]);
  const insights = useMemo(() => buildInsights(reports, currency), [reports, currency]);

  const setFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "shop_id" ? { branch_id: "" } : {}),
      ...(key === "period" && value !== "custom" ? { date_from: "", date_to: "" } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters((current) => ({
      ...initialFilters,
      shop_id: current.shop_id,
      branch_id: user?.role === "cashier" ? current.branch_id : "",
    }));
  };

  const exportCsv = async () => {
    const blob = await exportReportSummary(filters);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "menudigi-report-summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow={t("reports.analytics", "Analytics")}
        title={t("reports.title", "Reports & Analytics")}
        description={t("reports.description", "Review sales, orders, payments, products, branches, and hourly activity from real scoped restaurant data.")}
        secondaryActions={(
          <div className="flex flex-wrap gap-2">
            <AppButton type="button" variant="secondary" iconLeft={<RefreshCw className="h-4 w-4" />} onClick={load}>
              {t("reports.refresh", "Refresh")}
            </AppButton>
            {allowExport && hasData ? (
              <AppButton type="button" iconLeft={<Download className="h-4 w-4" />} onClick={exportCsv}>
                {t("reports.export", "Export")}
              </AppButton>
            ) : null}
          </div>
        )}
      />

      <AppCard title={t("reports.dateRange", "Date range")} description={t("reports.filterDescription", "Filter analytics by shop, branch, date period, order status, and payment status.")}>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-7">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilter("shop_id", event.target.value)}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilter("branch_id", event.target.value)}>
            {user?.role !== "cashier" ? <option value="">All branches</option> : null}
            {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label={t("reports.period", "Period")} value={filters.period} onChange={(event) => setFilter("period", event.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="custom">Custom</option>
          </Select>
          <Input label="From" type="date" disabled={filters.period !== "custom"} value={filters.date_from} onChange={(event) => setFilter("date_from", event.target.value)} />
          <Input label="To" type="date" disabled={filters.period !== "custom"} value={filters.date_to} onChange={(event) => setFilter("date_to", event.target.value)} />
          <Select label={t("reports.orderStatus", "Order status")} value={filters.order_status} onChange={(event) => setFilter("order_status", event.target.value)}>
            <option value="">All statuses</option>
            {["pending", "accepted", "preparing", "ready", "completed", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Select label="Payment" value={filters.payment_status} onChange={(event) => setFilter("payment_status", event.target.value)}>
            <option value="">All payments</option>
            {["unpaid", "pending", "paid", "failed"].map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <div className="md:col-span-2 xl:col-span-7">
            <AppButton type="button" variant="ghost" onClick={clearFilters}>{t("reports.clearFilters", "Clear filters")}</AppButton>
          </div>
        </div>
      </AppCard>

      {loading ? <LoadingState message="Loading analytics..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      {!loading && !loadError && summary ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <AppMetricCard title={t("reports.totalSales", "Total sales")} value={formatCurrency(summary.total_sales, currency)} description="Completed and paid orders" />
            <AppMetricCard title={t("reports.orders", "Orders")} value={summary.order_count} description="Non-cancelled orders" />
            <AppMetricCard title={t("reports.averageOrderValue", "Average order value")} value={formatCurrency(summary.average_order_value, currency)} description="Across active orders" />
            <AppMetricCard title={t("reports.paidAmount", "Paid amount")} value={formatCurrency(summary.paid_amount, currency)} description="Confirmed payments" />
            <AppMetricCard title={t("reports.pendingPayments", "Pending payments")} value={summary.pending_payments} description={formatCurrency(summary.pending_payment_amount, currency)} />
            <AppMetricCard title={t("reports.cancelledOrders", "Cancelled orders")} value={summary.cancelled_orders} description="Excluded from completed sales" />
          </section>

          {!hasData ? (
            <AppEmptyState
              title={t("reports.noReportData", "No report data")}
              description="No matching orders or payments were found. Create products, generate table QR codes, receive orders, or adjust filters."
              actionLabel={t("reports.clearFilters", "Clear filters")}
              onAction={clearFilters}
            />
          ) : null}

          <section className="grid gap-4 xl:grid-cols-3">
            {insights.map((insight) => (
              <AppCard key={insight.title} title={insight.title} description={insight.description} bodyClassName="p-4">
                <p className="text-2xl font-black text-slate-950">{insight.value}</p>
              </AppCard>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ReportChartCard title={t("reports.salesTrend", "Sales trend")} description="Daily paid sales and order count." summary={trendSummary(reports.sales_trend, currency)}>
              <Suspense fallback={<ChartFallback />}>
                <SalesTrendChart data={reports.sales_trend || []} />
              </Suspense>
            </ReportChartCard>
            <ReportChartCard title={t("reports.orderStatus", "Order status")} description="Order workflow distribution." summary={statusSummary(reports.order_status)}>
              <Suspense fallback={<ChartFallback />}>
                <OrderStatusBreakdownChart data={reports.order_status || []} />
              </Suspense>
            </ReportChartCard>
            <ReportChartCard title={t("reports.topProducts", "Top products")} description="Quantity sold from completed paid orders." summary={topProductSummary(reports.top_products)}>
              <Suspense fallback={<ChartFallback />}>
                <TopProductsChart data={topProductRows} />
              </Suspense>
            </ReportChartCard>
            <ReportChartCard title={t("reports.paymentMethods", "Payment methods")} description="Paid and pending amount by method." summary={paymentSummary(reports.payment_methods, currency)}>
              <Suspense fallback={<ChartFallback />}>
                <PaymentMethodsChart data={reports.payment_methods || []} />
              </Suspense>
            </ReportChartCard>
            <ReportChartCard title={t("reports.hourlyActivity", "Hourly activity")} description="Order count by hour of day." summary={busiestHourSummary(reports.hourly_activity)}>
              <Suspense fallback={<ChartFallback />}>
                <HourlyActivityChart data={reports.hourly_activity || []} />
              </Suspense>
            </ReportChartCard>
            <AppCard title={t("reports.branchPerformance", "Branch performance")} description="Sales, orders, average order value, and pending payments by branch." bodyClassName="p-0">
              <Suspense fallback={<ChartFallback />}>
                <BranchPerformanceTable rows={reports.branch_performance || []} currency={currency} />
              </Suspense>
            </AppCard>
          </section>
        </>
      ) : null}
    </div>
  );
}

function ChartFallback() {
  return <div className="h-full animate-pulse rounded-2xl bg-slate-100" aria-label="Loading chart" />;
}

function buildInsights(reports, currency) {
  if (!reports) return [];

  const busiest = (reports.hourly_activity || []).reduce((best, row) => (row.orders > (best?.orders || 0) ? row : best), null);
  const pending = reports.summary?.pending_payments || 0;
  const completed = reports.summary?.completed_orders || 0;

  return [
    {
      title: "Busiest hour",
      value: busiest?.orders ? `${busiest.label} (${busiest.orders} orders)` : "No activity yet",
      description: busiest?.orders ? "Use this to plan staffing and kitchen prep." : "Orders will reveal peak hours after customers start ordering.",
    },
    {
      title: "Payment review",
      value: pending ? `${pending} pending` : "Clear",
      description: pending ? "Pending payments need review before daily closing." : "No pending payments in this period.",
    },
    {
      title: "Completed sales",
      value: completed ? formatCurrency(reports.summary.total_sales, currency) : "No completed orders",
      description: completed ? "Completed and paid orders only." : "Completed paid sales will appear after orders are served and paid.",
    },
  ];
}

function trendSummary(rows = [], currency) {
  const total = rows.reduce((sum, row) => sum + Number(row.sales || 0), 0);
  return `Trend total: ${formatCurrency(total, currency)}.`;
}

function statusSummary(rows = []) {
  const total = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  return `${total} orders represented across statuses.`;
}

function topProductSummary(rows = []) {
  const top = rows[0];
  return top ? `${top.product_name} leads with ${top.quantity_sold} sold.` : "No completed paid product sales in this period.";
}

function paymentSummary(rows = [], currency) {
  const paid = rows.reduce((sum, row) => sum + Number(row.paid_total || 0), 0);
  return `Paid total by method: ${formatCurrency(paid, currency)}.`;
}

function busiestHourSummary(rows = []) {
  const busiest = rows.reduce((best, row) => (row.orders > (best?.orders || 0) ? row : best), null);
  return busiest?.orders ? `Busiest hour is ${busiest.label}.` : "No hourly activity in this period.";
}
