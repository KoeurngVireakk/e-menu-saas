import { formatCurrency } from "../../utils/currency";

export function Header({ title, shop, branch, number }) {
  return (
    <header className="text-center">
      <p className="text-[15px] font-black leading-tight text-slate-950">{shop?.name || "E-Menu"}</p>
      {branch?.name ? <p className="text-[11px] leading-tight text-slate-600">{branch.name}</p> : null}
      {shop?.phone ? <p className="text-[11px] leading-tight text-slate-600">{shop.phone}</p> : null}
      <div className="my-2 border-t border-dotted border-slate-400" />
      <p className="text-[13px] font-black uppercase tracking-wide text-slate-950">{title}</p>
      {number ? <p className="text-[11px] font-semibold text-slate-700">{number}</p> : null}
    </header>
  );
}

export function MetaRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex justify-between gap-3 text-[11px] leading-5">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function ItemRows({ items = [], currency = "KHR", showPrices = true }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item.id || `${item.product_name}-${item.quantity}`} className="grid gap-1">
          <div className="flex justify-between gap-3 text-[12px] font-bold text-slate-950">
            <span>{item.quantity} x {item.product_name}</span>
            {showPrices ? <span>{formatCurrency(item.total_price, currency)}</span> : null}
          </div>
          <OptionRows options={item.selected_options} />
          {item.note ? <p className="text-[11px] font-semibold text-slate-700">Note: {item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function OptionRows({ options }) {
  const rows = normalizeOptions(options);
  if (!rows.length) return null;

  return (
    <div className="grid gap-0.5 pl-3 text-[11px] text-slate-600">
      {rows.map((option, index) => (
        <p key={`${option}-${index}`}>- {option}</p>
      ))}
    </div>
  );
}

export function TotalRows({ totals = {}, currency = "KHR", invoice = false }) {
  const rows = [
    ["Subtotal", totals.subtotal],
    ["Discount", totals.discount_total],
    ["Service", totals.service_charge],
    ["VAT/Tax", totals.tax_total],
    invoice ? ["Deposit", totals.deposit_amount] : null,
    invoice ? ["Paid", totals.paid_amount] : null,
    invoice ? ["Balance", totals.balance_due] : null,
    ["Grand total", totals.grand_total],
  ].filter(Boolean);

  return (
    <div className="grid gap-1">
      {rows.map(([label, value]) => (
        <div key={label} className={`flex justify-between gap-3 text-[12px] ${label === "Grand total" ? "font-black text-slate-950" : "text-slate-700"}`}>
          <span>{label}</span>
          <span>{formatCurrency(value || 0, currency)}</span>
        </div>
      ))}
      {totals.secondary_currency_code && totals.secondary_currency_total ? (
        <div className="flex justify-between gap-3 text-[11px] font-semibold text-slate-600">
          <span>{totals.secondary_currency_code}</span>
          <span>{formatCurrency(totals.secondary_currency_total, totals.secondary_currency_code)}</span>
        </div>
      ) : null}
    </div>
  );
}

function normalizeOptions(options) {
  if (!options) return [];
  if (!Array.isArray(options)) return [];

  return options.flatMap((option) => {
    if (typeof option === "string") return [option];
    const label = option.option_name || option.name || option.label || "Option";
    const values = option.values || option.selected_values || option.value_names;
    if (Array.isArray(values)) {
      return values.map((value) => `${label}: ${typeof value === "string" ? value : value.name || value.label || value.value}`);
    }
    const value = option.value_name || option.value || option.product_option_value_name;
    return value ? [`${label}: ${value}`] : [label];
  });
}
