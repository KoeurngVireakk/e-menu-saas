import { formatCurrency } from "../../utils/currency";
import { printStyles } from "./printStyles";

export default function ShiftReportPrint({ shift }) {
  const currency = shift?.shop?.currency_code || "KHR";

  return (
    <section className="print-surface rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-900 shadow-sm" style={{ "--paper-width": "80mm" }}>
      <style>{printStyles}</style>
      <header className="text-center">
        <p className="text-[15px] font-black text-slate-950">{shift?.shop?.name || "E-Menu"}</p>
        <p className="text-[11px] text-slate-600">{shift?.branch?.name || "-"}</p>
        <div className="my-2 border-t border-dotted border-slate-400" />
        <p className="text-[13px] font-black uppercase tracking-wide text-slate-950">Shift Report</p>
        <p className="text-[11px] text-slate-600">{shift?.shift_code}</p>
      </header>
      <div className="my-3 grid gap-1">
        <Row label="Cashier" value={shift?.user?.name || "-"} />
        <Row label="Opened" value={formatTime(shift?.opened_at)} />
        <Row label="Closed" value={formatTime(shift?.closed_at)} />
        <Row label="Opening float" value={formatCurrency(shift?.opening_float, currency)} />
        <Row label="Cash payments" value={formatCurrency(shift?.cash_payment_total, currency)} />
        <Row label="Cash in" value={formatCurrency(shift?.cash_in_total, currency)} />
        <Row label="Cash out" value={formatCurrency(shift?.cash_out_total, currency)} />
        <Row label="Expected cash" value={formatCurrency(shift?.expected_cash_total, currency)} strong />
        <Row label="Counted cash" value={formatCurrency(shift?.counted_cash_total, currency)} />
        <Row label="Difference" value={formatCurrency(shift?.cash_difference, currency)} strong />
      </div>
      {shift?.movements?.length ? (
        <>
          <div className="my-2 border-t border-dotted border-slate-400" />
          <div className="grid gap-1">
            {shift.movements.map((movement) => (
              <Row key={movement.id} label={`${movement.type}: ${movement.reason}`} value={formatCurrency(movement.amount, currency)} />
            ))}
          </div>
        </>
      ) : null}
      {shift?.note ? <p className="mt-3 text-[11px] text-slate-600">Note: {shift.note}</p> : null}
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-3 text-[12px] ${strong ? "font-black text-slate-950" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
