import { motion } from "framer-motion";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppBadge from "../components/AppBadge";
import OrderItemsList from "./OrderItemsList";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import useLanguage from "../../i18n/useLanguage";

export default function KitchenOrderCard({ order, isNew = false, allowUpdate = true, onOrderStatus, onItemStatus }) {
  const { t } = useLanguage();

  return (
    <motion.div initial={isNew ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <AppCard className={`premium-interactive transition ${isNew ? "border-blue-300 bg-blue-50/50 ring-2 ring-blue-100" : ""}`} bodyClassName="grid gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="khmer-heading text-2xl font-black text-slate-950">{order.order_number}</h3>
            <p className="khmer-text text-sm font-bold leading-6 text-slate-600">{order.branch?.name || t("operations.branch")} · {order.dining_table?.table_name || order.order_type}</p>
            {order.note ? <p className="khmer-text mt-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">{order.note}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2 sm:grid sm:justify-items-end">
            <AppBadge status={order.elapsed_minutes > 20 ? "warning" : "info"}>{t("operations.elapsedMinutes", "{{count}} min").replace("{{count}}", order.elapsed_minutes)}</AppBadge>
            <PaymentStatusBadge value={order.payment_status} />
          </div>
        </div>

        <OrderItemsList items={order.items || []} currencyCode={order.currency_code} kitchen />

        {allowUpdate ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap" aria-label={`Kitchen actions for order ${order.order_number}`}>
            {order.order_status === "pending" ? <AppButton type="button" size="lg" className="w-full xl:w-auto" onClick={() => onOrderStatus(order, "accepted")}>{t("operations.accept")}</AppButton> : null}
            {["pending", "accepted"].includes(order.order_status) ? <AppButton type="button" size="lg" className="w-full xl:w-auto" variant="secondary" onClick={() => onOrderStatus(order, "preparing")}>{t("operations.preparing")}</AppButton> : null}
            {["pending", "accepted", "preparing"].includes(order.order_status) ? <AppButton type="button" size="lg" className="w-full xl:w-auto" onClick={() => onOrderStatus(order, "ready")}>{t("operations.ready")}</AppButton> : null}
            {order.order_status === "ready" ? <AppButton type="button" size="lg" className="w-full xl:w-auto" variant="success" onClick={() => onOrderStatus(order, "completed")}>{t("operations.complete")}</AppButton> : null}
            {(order.items || []).some((item) => ["pending", "preparing"].includes(item.kitchen_status)) ? (
              <AppButton
                type="button"
                size="lg"
                variant="outline"
                className="w-full xl:w-auto"
                aria-label={`Mark unfinished items ready for order ${order.order_number}`}
                onClick={() => {
                  (order.items || []).filter((item) => ["pending", "preparing"].includes(item.kitchen_status)).forEach((item) => onItemStatus(item, "ready"));
                }}
              >
                {t("operations.itemReady")}
              </AppButton>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <OrderStatusBadge value={order.order_status} />
          {isNew ? <AppBadge status="info">{t("operations.newOrder")}</AppBadge> : null}
        </div>
      </AppCard>
    </motion.div>
  );
}
