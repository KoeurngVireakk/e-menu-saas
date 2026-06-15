import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDualCurrency } from "../utils/currency";

export default function ReceiptPreview({ receipt, invoice }) {
  const order = receipt?.order || invoice?.order || {};
  const shop = order.shop || invoice?.shop || {};
  const branch = order.branch || invoice?.branch || {};
  const items = receipt?.order?.items || invoice?.items || [];
  const totals = receipt?.totals || invoice || order;
  const title = invoice ? "Invoice" : "Receipt";
  const number = invoice?.invoice_number || receipt?.receipt_number || order.order_number;
  const currency = totals.currency_code || order.currency_code || invoice?.currency_code || "KHR";

  return (
    <div className="receipt-print rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-900 print:border-0 print:p-0">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible; }
          .receipt-print { position: absolute; left: 0; top: 0; width: 80mm; font-size: 11px; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="text-center">
        <p className="text-lg font-black">{shop.name || "E-Menu"}</p>
        <p className="text-xs text-slate-500">{branch.name || "Main branch"}</p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide">{title}</p>
        <p className="font-semibold">{number}</p>
      </div>

      <div className="mt-4 grid gap-1 border-y border-dashed border-slate-300 py-3 text-xs">
        <Row label="Order" value={order.order_number} />
        <Row label="Table" value={order.dining_table?.table_name || order.order_type || "-"} />
        <Row label="Customer" value={order.customer_name || invoice?.customer_name || "-"} />
        <Row label="Payment" value={<StatusBadge value={order.payment_status || invoice?.status || "unpaid"} />} />
      </div>

      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="grid gap-1">
            <div className="flex justify-between gap-3">
              <span>{item.quantity} x {item.product_name}</span>
              <span>{formatCurrency(item.total_price, currency)}</span>
            </div>
            {optionSummary(item.selected_options_json) ? (
              <p className="text-xs text-slate-500">{optionSummary(item.selected_options_json)}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-1 border-t border-dashed border-slate-300 pt-3">
        <Row label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
        <Row label="Discount" value={`-${formatCurrency(totals.discount_total, currency)}`} />
        <Row label="Service" value={formatCurrency(totals.service_charge, currency)} />
        <Row label="VAT/Tax" value={formatCurrency(totals.tax_total, currency)} />
        {invoice ? <Row label="Paid" value={formatCurrency(invoice.paid_amount, currency)} /> : null}
        {invoice ? <Row label="Balance" value={formatCurrency(invoice.balance_due, currency)} /> : null}
        <div className="mt-2 flex justify-between gap-3 text-base font-black">
          <span>Total</span>
          <span>{formatDualCurrency(totals.grand_total, currency, order.secondary_currency_total, order.secondary_currency_code)}</span>
        </div>
      </div>

      {receipt?.settings?.receipt_footer_text ? (
        <p className="mt-4 text-center text-xs text-slate-500">{receipt.settings.receipt_footer_text}</p>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold">{value || "-"}</span>
    </div>
  );
}

function optionSummary(options) {
  return (options || [])
    .flatMap((option) => (option.values || []).map((value) => `${option.name}: ${value.name}`))
    .join(", ");
}
