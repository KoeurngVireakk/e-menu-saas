import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { AppButton, AppCard, AppEmptyState, AppSkeleton, AppStatusBadge } from "../../design-system/components";

export default function RecentOrdersPanel({
  title,
  description,
  orders = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  viewAllLabel,
  currency = "KHR",
}) {
  return (
    <AppCard
      title={title}
      description={description}
      action={<AppButton as={Link} to="/admin/orders" variant="secondary" size="sm">{viewAllLabel}</AppButton>}
      labelled
    >
      {loading ? <AppSkeleton variant="table" rows={4} /> : null}
      {!loading && !orders.length ? (
        <AppEmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={() => { window.location.href = "/admin/tables"; }}
          contained={false}
        />
      ) : null}
      {!loading && orders.length ? (
        <div className="grid gap-3">
          {orders.slice(0, 5).map((order) => (
            <OrderRow key={order.id || order.order_number} order={order} currency={currency} />
          ))}
        </div>
      ) : null}
    </AppCard>
  );
}

function OrderRow({ order, currency }) {
  return (
    <Link
      to="/admin/orders"
      className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="min-w-0">
        <span className="block truncate font-black text-slate-950">{order.order_number || `#${order.id}`}</span>
        <span className="mt-1 block truncate text-sm text-slate-500">
          {order.branch?.name || "Branch"} · {Number(order.grand_total || 0).toLocaleString()} {order.currency_code || currency}
        </span>
      </span>
      <span className="flex shrink-0 flex-wrap gap-2">
        <AppStatusBadge value={order.order_status} />
        <AppStatusBadge value={order.payment_status} />
      </span>
    </Link>
  );
}
