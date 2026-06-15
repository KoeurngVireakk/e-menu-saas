import { formatCurrency } from "../../utils/currency";
import { printStyles } from "./printStyles";

export default function DailyClosingPrint({ closing }) {
  const currency = closing?.currency_code || "KHR";
  const summary = closing?.sales_summary_json || {};
  const payments = closing?.payment_totals_json || {};

  return (
    <section className="print-surface rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-900 shadow-sm" style={{ "--paper-width": "80mm" }}>
      <style>{printStyles}</style>
      <header className="text-center">
        <p className="text-[15px] font-black text-slate-950">{closing?.shop?.name || "E-Menu"}</p>
        {closing?.branch?.name ? <p className="text-[11px] text-slate-600">{closing.branch.name}</p> : null}
        <div className="my-2 border-t border-dotted border-slate-400" />
        <p className="text-[13px] font-black uppercase tracking-wide text-slate-950">Daily Closing</p>
        <p className="text-[11px] text-slate-600">{closing?.closing_date}</p>
      </header>
      <div className="my-3 grid gap-1">
        <Row label="Expected cash" value={formatCurrency(closing?.expected_cash_total, currency)} />
        <Row label="Counted cash" value={formatCurrency(closing?.counted_cash_total, currency)} />
        <Row label="Difference" value={formatCurrency(closing?.cash_difference, currency)} strong />
        <Row label="Net sales" value={formatCurrency(summary.net_sales, currency)} />
        <Row label="Paid total" value={formatCurrency(summary.paid_total, currency)} />
      </div>
      <div className="my-2 border-t border-dotted border-slate-400" />
      <div className="grid gap-1">
        {Object.entries(payments.methods || {}).map(([method, data]) => (
          <Row key={method} label={method} value={formatCurrency(data.paid_total, currency)} />
        ))}
      </div>
      {closing?.note ? <p className="mt-3 text-[11px] text-slate-600">Note: {closing.note}</p> : null}
      <p className="mt-3 text-center text-[10px] text-slate-500">Closed by {closing?.closer?.name || "-"}</p>
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-3 text-[12px] ${strong ? "font-black text-slate-950" : "text-slate-700"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
