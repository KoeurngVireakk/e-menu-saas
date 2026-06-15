import { Header, ItemRows, MetaRow, TotalRows } from "./PrintRows";
import { paperWidthClass, printStyles } from "./printStyles";

export default function ReceiptPrint({ print }) {
  const width = print?.paper_size || "80mm";
  const order = print?.order || {};
  const totals = print?.totals || {};
  const currency = totals.currency_code || print?.shop?.currency_code || "KHR";

  return (
    <section className={`print-surface rounded-md border border-slate-200 bg-white p-4 font-sans text-slate-900 shadow-sm ${paperWidthClass(width)}`} style={{ "--paper-width": width }}>
      <style>{printStyles}</style>
      <Header title="Receipt" shop={print?.shop} branch={print?.branch} number={print?.receipt_number || order.order_number} />
      <div className="my-2 grid gap-0.5 border-b border-dotted border-slate-400 pb-2">
        <MetaRow label="Order" value={order.order_number} />
        <MetaRow label="Table" value={order.table || order.order_type} />
        <MetaRow label="Customer" value={order.customer_name} />
        <MetaRow label="Payment" value={order.payment_status} />
        <MetaRow label="Method" value={order.payment_method} />
      </div>
      <ItemRows items={print?.items || []} currency={currency} />
      <div className="my-2 border-t border-dotted border-slate-400" />
      <TotalRows totals={totals} currency={currency} />
      {print?.settings?.receipt_footer_text ? <p className="mt-3 text-center text-[11px] text-slate-600">{print.settings.receipt_footer_text}</p> : null}
      <p className="mt-3 text-center text-[10px] text-slate-500">Generated {formatTime(print?.generated_at)}</p>
    </section>
  );
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}
