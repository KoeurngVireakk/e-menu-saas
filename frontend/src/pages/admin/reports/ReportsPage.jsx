import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import SalesReportPrint from "../../../components/print/SalesReportPrint";
import { Button, Card, ErrorState, Input, LoadingState, Select, StatCard } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "../../../utils/currency";
import { canExportReports } from "../../../utils/permissions";

export default function ReportsPage() {
  const { user } = useAuth();
  const allowExport = canExportReports(user);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", date: today() });
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      const loaded = response.data.data.shops;
      setShops(loaded);
      setFilters((current) => ({ ...current, shop_id: loaded[0]?.id || "" }));
    });
  }, []);

  useEffect(() => {
    if (!filters.shop_id) {
      return;
    }

    api.get(`/shops/${filters.shop_id}/branches`).then((response) => {
      const loaded = response.data.data.branches;
      setBranches(loaded);
      setFilters((current) => ({
        ...current,
        branch_id: user?.role === "cashier" ? loaded[0]?.id || "" : current.branch_id,
      }));
    });
  }, [filters.shop_id, user?.role]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);

  const load = useCallback(() => {
    if (!filters.shop_id || (user?.role === "cashier" && !filters.branch_id)) {
      return;
    }

    setLoading(true);
    setLoadError("");
    const params = cleanParams(filters);

    Promise.all([
      api.get("/reports/sales-summary", { params }),
      api.get("/reports/payment-methods", { params }),
      api.get("/reports/product-sales", { params }),
    ])
      .then(([summaryResponse, paymentsResponse, productsResponse]) => {
        setSummary(summaryResponse.data.data.summary);
        setPayments(paymentsResponse.data.data.payment_methods);
        setProducts(productsResponse.data.data.products);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load reports.")))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const report = { shop: selectedShop, summary, payment_methods: payments, products };
  const currency = summary?.currency_code || selectedShop?.currency_code || "KHR";

  const exportCsv = () => {
    const rows = [
      ["Product", "Quantity", "Gross", "Discount", "Net"],
      ...products.map((product) => [product.product_name, product.quantity_sold, product.gross_total, product.discount_total, product.net_total]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${filters.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 p-4 no-print">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {user?.role !== "cashier" ? <option value="">All branches</option> : null}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <Button type="button" onClick={load}>Refresh</Button>
          {summary ? <Button type="button" variant="secondary" onClick={() => window.print()}>Print</Button> : null}
          {allowExport && products.length ? <Button type="button" variant="secondary" onClick={exportCsv}>Export CSV</Button> : null}
        </div>
      </Card>

      {loading ? <LoadingState message="Loading report..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      {summary && !loading && !loadError ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 no-print">
            <StatCard label="Net sales" value={formatCurrency(summary.net_sales, currency)} tone="green" />
            <StatCard label="Net after expenses" value={formatCurrency(summary.net_after_expenses, currency)} tone="blue" />
            <StatCard label="Expenses" value={formatCurrency(summary.total_expenses, currency)} />
            <StatCard label="Paid total" value={formatCurrency(summary.paid_total, currency)} tone="blue" />
            <StatCard label="Unpaid total" value={formatCurrency(summary.unpaid_total, currency)} />
            <StatCard label="Completed orders" value={summary.completed_orders} note={`${summary.cancelled_orders} cancelled`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px] no-print">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-slate-950">Payment Methods</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(payments?.methods || {}).map(([method, data]) => (
                  <div key={method} className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-bold uppercase text-slate-500">{method}</p>
                    <p className="mt-2 text-xl font-black text-slate-950">{formatCurrency(data.paid_total, currency)}</p>
                    <p className="text-xs text-slate-500">{data.count} payments</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h2 className="text-lg font-bold text-slate-950">Order Status</h2>
              <div className="mt-4 grid gap-2">
                {summary.order_statuses?.map((row) => (
                  <div key={row.status} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span>{row.status}</span>
                    <strong>{row.count}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="no-print">
            <DataTable
              columns={[
                { key: "product_name", label: "Product" },
                { key: "quantity_sold", label: "Qty" },
                { key: "gross_total", label: "Gross", render: (row) => formatCurrency(row.gross_total, currency) },
                { key: "discount_total", label: "Discount", render: (row) => formatCurrency(row.discount_total, currency) },
                { key: "net_total", label: "Net", render: (row) => formatCurrency(row.net_total, currency) },
              ]}
              rows={products}
              emptyMessage="No product sales for this period."
            />
          </div>

          <SalesReportPrint report={report} />
        </>
      ) : null}
    </div>
  );
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
