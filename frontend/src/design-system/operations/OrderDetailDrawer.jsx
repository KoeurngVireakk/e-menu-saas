import { Link } from "react-router-dom";
import { ChefHat, Printer, ReceiptText, XCircle } from "lucide-react";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppSheet from "../components/AppSheet";
import { formatCurrency } from "../../utils/currency";
import OperationTimeline from "./OperationTimeline";
import OrderItemsList from "./OrderItemsList";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const nextStatuses = [
  ["accepted", "Accept"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["completed", "Complete"],
  ["cancelled", "Cancel"],
];

export default function OrderDetailDrawer({
  order,
  open,
  onClose,
  onStatus,
  onReceipt,
  onPrint,
  onInvoice,
  allowStatusUpdate,
  allowKitchenPrint,
  allowReceiptPrint,
  allowInvoiceActions,
  receipt,
  printPreview,
  receiptPreview,
  kitchenPrintPreview,
}) {
  if (!order) return null;

  return (
    <AppSheet open={open} title={`Order ${order.order_number}`} onClose={onClose} size="xl">
      <div className="grid gap-5">
        <AppCard bodyClassName="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">Order summary</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{order.order_number}</h2>
              <p className="mt-1 text-sm text-slate-500">{order.branch?.name || "Branch"} · {order.dining_table?.table_name || order.order_type}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge value={order.order_status} />
              <PaymentStatusBadge value={order.payment_status} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Customer" value={order.customer_name || "Guest"} />
            <Detail label="Phone" value={order.customer_phone || "-"} />
            <Detail label="Items" value={`${order.items?.length || 0} item lines`} />
            <Detail label="Total" value={formatCurrency(order.grand_total, order.currency_code)} />
          </div>

          {order.note ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{order.note}</p> : null}
        </AppCard>

        {allowStatusUpdate ? (
          <AppCard title="Update status" description="Use one clear next action. Cancel requires confirmation.">
            <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap" aria-label={`Status actions for order ${order.order_number}`}>
              {nextStatuses.map(([status, label]) => (
                <AppButton
                  key={status}
                  type="button"
                  variant={status === "cancelled" ? "danger" : "secondary"}
                  iconLeft={status === "cancelled" ? <XCircle className="h-4 w-4" /> : null}
                  onClick={() => onStatus(order, status)}
                >
                  {label}
                </AppButton>
              ))}
            </div>
          </AppCard>
        ) : null}

        <AppCard title="Items">
          <OrderItemsList items={order.items || []} currencyCode={order.currency_code} kitchen />
        </AppCard>

        <AppCard title="Print and documents">
          <div className="flex flex-wrap gap-2">
            <AppButton type="button" variant="outline" iconLeft={<ReceiptText className="h-4 w-4" />} onClick={() => onReceipt(order)}>View receipt</AppButton>
            <AppButton as={Link} to="/admin/kitchen" variant="secondary" iconLeft={<ChefHat className="h-4 w-4" />}>Open Kitchen Display</AppButton>
            {allowKitchenPrint ? <AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => onPrint(order, "kitchen")}>Print kitchen ticket</AppButton> : null}
            {allowReceiptPrint ? <AppButton type="button" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => onPrint(order, "receipt")}>Print receipt</AppButton> : null}
            {allowInvoiceActions ? <AppButton type="button" onClick={() => onInvoice(order)}>Create invoice</AppButton> : null}
          </div>
          {receipt ? <div className="mt-4">{receiptPreview}</div> : null}
          {printPreview ? <div className="mt-4">{printPreview.type === "kitchen" ? kitchenPrintPreview : receiptPreview}</div> : null}
        </AppCard>

        <AppCard title="Status timeline">
          <OperationTimeline
            items={[
              { label: "Created", time: order.created_at ? new Date(order.created_at).toLocaleString() : null },
              { label: `Current status: ${order.order_status}` },
              { label: `Payment: ${order.payment_status}` },
            ]}
          />
        </AppCard>
      </div>
    </AppSheet>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}
