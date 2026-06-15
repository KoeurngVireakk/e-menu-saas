import { formatCurrency } from "../../utils/currency";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderItemsList({ items = [], currencyCode = "KHR", kitchen = false }) {
  if (!items.length) return <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No order items available.</p>;

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id || `${item.product_name}-${item.quantity}`} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-black text-slate-950">{item.quantity}x {item.product_name}</p>
              {item.note ? <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-800">{item.note}</p> : null}
              <OptionList options={item.selected_options} />
            </div>
            <div className="grid justify-items-end gap-1">
              {kitchen ? <OrderStatusBadge value={item.kitchen_status || "pending"} /> : null}
              {item.total_price ? <span className="text-sm font-bold text-slate-700">{formatCurrency(item.total_price, currencyCode)}</span> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OptionList({ options = [] }) {
  const rows = options.flatMap((option) => (option.values || []).map((value) => `${option.name}: ${value.name}`));
  if (!rows.length) return null;

  return (
    <ul className="mt-2 grid gap-1 text-sm text-slate-600">
      {rows.map((row) => <li key={row}>{row}</li>)}
    </ul>
  );
}
