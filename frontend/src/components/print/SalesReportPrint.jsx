import { formatCurrency } from "../../utils/currency";
import { printStyles } from "./printStyles";

export default function SalesReportPrint({ report }) {
  const summary = report?.summary || {};
  const payments = report?.payment_methods || {};
  const products = report?.products || [];
  const currency = summary.currency_code || payments.currency_code || "KHR";

  return (
    <section className="print-surface rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-900 shadow-sm" style={{ "--paper-width": "210mm" }}>
      <style>{printStyles}</style>
      <header className="border-b border-dotted border-slate-400 pb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Sales Report</p>
        <h2 className="text-xl font-black text-slate-950">{report?.shop?.name || "E-Menu"}</h2>
        <p className="text-sm text-slate-500">{summary.date_from} to {summary.date_to}</p>
      </header>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Row label="Total orders" value={summary.total_orders} />
        <Row label="Completed orders" value={summary.completed_orders} />
        <Row label="Gross sales" value={formatCurrency(summary.gross_sales, currency)} />
        <Row label="Net sales" value={formatCurrency(summary.net_sales, currency)} />
        <Row label="Paid total" value={formatCurrency(summary.paid_total, currency)} />
        <Row label="Unpaid total" value={formatCurrency(summary.unpaid_total, currency)} />
      </div>
      <div className="my-4 border-t border-dotted border-slate-400" />
      <h3 className="font-bold text-slate-950">Payment Methods</h3>
      <div className="mt-2 grid gap-1">
        {Object.entries(payments.methods || {}).map(([method, data]) => (
          <Row key={method} label={method} value={formatCurrency(data.paid_total, currency)} />
        ))}
      </div>
      <div className="my-4 border-t border-dotted border-slate-400" />
      <h3 className="font-bold text-slate-950">Best Sellers</h3>
      <div className="mt-2 grid gap-1">
        {products.map((product) => (
          <Row key={`${product.product_id}-${product.product_name}`} label={`${product.quantity_sold} x ${product.product_name}`} value={formatCurrency(product.net_total, currency)} />
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}
