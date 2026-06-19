import { motion } from "framer-motion";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppBadge from "../components/AppBadge";
import OrderItemsList from "./OrderItemsList";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

export default function KitchenOrderCard({ order, isNew = false, allowUpdate = true, onOrderStatus, onItemStatus }) {
  return (
    <motion.div initial={isNew ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <AppCard className={`transition hover:shadow-md ${isNew ? "border-blue-300 bg-blue-50/50" : ""}`} bodyClassName="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black text-slate-950">{order.order_number}</h3>
            <p className="text-sm font-bold text-slate-600">{order.branch?.name || "Branch"} · {order.dining_table?.table_name || order.order_type}</p>
            {order.note ? <p className="mt-2 rounded-xl bg-amber-50 p-2 text-sm font-semibold text-amber-800">{order.note}</p> : null}
          </div>
          <div className="grid justify-items-end gap-2">
            <AppBadge status={order.elapsed_minutes > 20 ? "warning" : "info"}>{order.elapsed_minutes} min</AppBadge>
            <PaymentStatusBadge value={order.payment_status} />
          </div>
        </div>

        <OrderItemsList items={order.items || []} currencyCode={order.currency_code} kitchen />

        {allowUpdate ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap" aria-label={`Kitchen actions for order ${order.order_number}`}>
            {order.order_status === "pending" ? <AppButton type="button" size="lg" onClick={() => onOrderStatus(order, "accepted")}>Accept</AppButton> : null}
            {["pending", "accepted"].includes(order.order_status) ? <AppButton type="button" size="lg" variant="secondary" onClick={() => onOrderStatus(order, "preparing")}>Preparing</AppButton> : null}
            {["pending", "accepted", "preparing"].includes(order.order_status) ? <AppButton type="button" size="lg" onClick={() => onOrderStatus(order, "ready")}>Ready</AppButton> : null}
            {order.order_status === "ready" ? <AppButton type="button" size="lg" variant="success" onClick={() => onOrderStatus(order, "completed")}>Complete</AppButton> : null}
            {(order.items || []).some((item) => ["pending", "preparing"].includes(item.kitchen_status)) ? (
              <AppButton
                type="button"
                size="lg"
                variant="outline"
                aria-label={`Mark unfinished items ready for order ${order.order_number}`}
                onClick={() => {
                  (order.items || []).filter((item) => ["pending", "preparing"].includes(item.kitchen_status)).forEach((item) => onItemStatus(item, "ready"));
                }}
              >
                Item ready
              </AppButton>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge value={order.order_status} />
          {isNew ? <AppBadge status="info">New order</AppBadge> : null}
        </div>
      </AppCard>
    </motion.div>
  );
}
