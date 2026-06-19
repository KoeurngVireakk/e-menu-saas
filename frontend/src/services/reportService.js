import api from "../api/axios";

export function cleanReportFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

export async function getAnalyticsOverview(filters) {
  const response = await api.get("/reports/analytics", { params: cleanReportFilters(filters) });
  return response.data.data;
}

export async function getReportSummary(filters) {
  const response = await api.get("/reports/summary", { params: cleanReportFilters(filters) });
  return response.data.data.summary;
}

export async function getSalesTrend(filters) {
  const response = await api.get("/reports/sales-trend", { params: cleanReportFilters(filters) });
  return response.data.data.sales_trend;
}

export async function getOrderStatusReport(filters) {
  const response = await api.get("/reports/order-status", { params: cleanReportFilters(filters) });
  return response.data.data.order_status;
}

export async function getTopProducts(filters) {
  const response = await api.get("/reports/top-products", { params: cleanReportFilters(filters) });
  return response.data.data.top_products;
}

export async function getPaymentMethods(filters) {
  const response = await api.get("/reports/analytics", { params: cleanReportFilters(filters) });
  return response.data.data.reports.payment_methods;
}

export async function getBranchPerformance(filters) {
  const response = await api.get("/reports/branch-performance", { params: cleanReportFilters(filters) });
  return response.data.data.branch_performance;
}

export async function getHourlyActivity(filters) {
  const response = await api.get("/reports/hourly-activity", { params: cleanReportFilters(filters) });
  return response.data.data.hourly_activity;
}

export async function exportReportSummary(filters) {
  const response = await api.get("/reports/export-summary", {
    params: cleanReportFilters(filters),
    responseType: "blob",
  });

  return response.data;
}
