import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { AppButton, AppCard, AppEmptyState, AppSkeleton, AppStatusBadge } from "../../design-system/components";

export default function PendingPaymentsPanel({
  title,
  description,
  orders = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  viewAllLabel,
  currency = "KHR",
}) {
  return (
    <AppCard
      title={title}
      description={description}
      action={<AppButton as={Link} to="/admin/payments" variant="secondary" size="sm">{viewAllLabel}</AppButton>}
      labelled
    >
      {loading ? <AppSkeleton variant="table" rows={3} /> : null}
      {!loading && !orders.length ? (
        <AppEmptyState
          icon={CreditCard}
          title={emptyTitle}
          description={emptyDescription}
          contained={false}
        />
      ) : null}
      {!loading && orders.length ? (
        <div className="grid gap-3">
          {orders.slice(0, 4).map((order) => (
            <Link
              key={order.id || order.order_number}
              to="/admin/payments"
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0">
                <span className="block truncate font-black text-slate-950">{order.order_number || `#${order.id}`}</span>
                <span className="mt-1 block truncate text-sm text-slate-500">
                  {Number(order.grand_total || 0).toLocaleString()} {order.currency_code || currency}
                </span>
              </span>
              <span className="flex shrink-0 flex-wrap gap-2">
                <AppStatusBadge value={order.payment_status || "pending"} />
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </AppCard>
  );
}
