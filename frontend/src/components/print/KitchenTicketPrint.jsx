import { Header, ItemRows, MetaRow } from "./PrintRows";
import { paperWidthClass, printStyles } from "./printStyles";

export default function KitchenTicketPrint({ print }) {
  const width = print?.paper_size || "80mm";
  const order = print?.order || {};

  return (
    <section className={`print-surface rounded-md border border-slate-200 bg-white p-4 font-sans text-slate-900 shadow-sm ${paperWidthClass(width)}`} style={{ "--paper-width": width }}>
      <style>{printStyles}</style>
      <Header title="Kitchen Ticket" shop={print?.shop} branch={print?.branch} number={order.order_number} />
      <div className="my-2 grid gap-0.5 border-b border-dotted border-slate-400 pb-2">
        <MetaRow label="Table" value={order.table || order.order_type} />
        <MetaRow label="Status" value={order.order_status} />
        <MetaRow label="Generated" value={formatTime(print?.generated_at)} />
      </div>
      <ItemRows items={print?.items || []} showPrices={false} />
      {order.note ? <p className="mt-3 border-t border-dotted border-slate-400 pt-2 text-[12px] font-bold text-slate-950">Order note: {order.note}</p> : null}
      <p className="mt-3 text-center text-[10px] text-slate-500">Station: {print?.station?.name || "Browser print"}</p>
    </section>
  );
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}
