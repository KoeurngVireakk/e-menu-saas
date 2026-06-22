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
import useLanguage from "../../i18n/useLanguage";

const nextStatuses = [
  ["accepted", "operations.accept"],
  ["preparing", "operations.preparing"],
  ["ready", "operations.ready"],
  ["completed", "operations.complete"],
  ["cancelled", "operations.cancel"],
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
  const { t } = useLanguage();
  if (!order) return null;

  return (
    <AppSheet open={open} title={`Order ${order.order_number}`} onClose={onClose} size="xl">
      <div className="grid gap-5">
        <AppCard bodyClassName="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="khmer-label text-xs font-black text-blue-600">{t("operations.orderSummary")}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{order.order_number}</h2>
              <p className="mt-1 text-sm text-slate-500">{order.branch?.name || t("operations.branch")} · {order.dining_table?.table_name || order.order_type}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge value={order.order_status} />
              <PaymentStatusBadge value={order.payment_status} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label={t("operations.customer")} value={order.customer_name || t("operations.guest")} />
            <Detail label={t("operations.phone")} value={order.customer_phone || "-"} />
            <Detail label={t("operations.items")} value={`${order.items?.length || 0} ${t("operations.itemLines")}`} />
            <Detail label={t("operations.total")} value={formatCurrency(order.grand_total, order.currency_code)} />
          </div>

          {order.note ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{order.note}</p> : null}
        </AppCard>

        {allowStatusUpdate ? (
          <AppCard title={t("operations.updateStatus")} description={t("operations.updateStatusHelp")}>
            <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap" aria-label={`Status actions for order ${order.order_number}`}>
              {nextStatuses.map(([status, label]) => (
                <AppButton
                  key={status}
                  type="button"
                  variant={status === "cancelled" ? "danger" : "secondary"}
                  className="w-full xl:w-auto"
                  iconLeft={status === "cancelled" ? <XCircle className="h-4 w-4" /> : null}
                  onClick={() => onStatus(order, status)}
                >
                  {t(label)}
                </AppButton>
              ))}
            </div>
          </AppCard>
        ) : null}

        <AppCard title={t("operations.items")}>
          <OrderItemsList items={order.items || []} currencyCode={order.currency_code} kitchen />
        </AppCard>

        <AppCard title={t("operations.printDocuments")}>
          <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
            <AppButton type="button" className="w-full xl:w-auto" variant="outline" iconLeft={<ReceiptText className="h-4 w-4" />} onClick={() => onReceipt(order)}>{t("operations.viewReceipt")}</AppButton>
            <AppButton as={Link} className="w-full xl:w-auto" to="/admin/kitchen" variant="secondary" iconLeft={<ChefHat className="h-4 w-4" />}>{t("operations.openKitchen")}</AppButton>
            {allowKitchenPrint ? <AppButton type="button" className="w-full xl:w-auto" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => onPrint(order, "kitchen")}>{t("operations.printKitchen")}</AppButton> : null}
            {allowReceiptPrint ? <AppButton type="button" className="w-full xl:w-auto" variant="secondary" iconLeft={<Printer className="h-4 w-4" />} onClick={() => onPrint(order, "receipt")}>{t("operations.printReceipt")}</AppButton> : null}
            {allowInvoiceActions ? <AppButton type="button" className="w-full xl:w-auto" onClick={() => onInvoice(order)}>{t("operations.createInvoice")}</AppButton> : null}
          </div>
          {receipt ? <div className="mt-4">{receiptPreview}</div> : null}
          {printPreview ? <div className="mt-4">{printPreview.type === "kitchen" ? kitchenPrintPreview : receiptPreview}</div> : null}
        </AppCard>

        <AppCard title={t("operations.statusTimeline")}>
          <OperationTimeline
            items={[
              { label: t("operations.created"), time: order.created_at ? new Date(order.created_at).toLocaleString() : null },
              { label: `${t("operations.currentStatus")}: ${order.order_status}` },
              { label: `${t("operations.payment")}: ${order.payment_status}` },
            ]}
          />
        </AppCard>
      </div>
    </AppSheet>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
      <p className="khmer-label text-xs font-black text-slate-500">{label}</p>
      <p className="khmer-text mt-1 wrap-break-word font-bold text-slate-900">{value}</p>
    </div>
  );
}
