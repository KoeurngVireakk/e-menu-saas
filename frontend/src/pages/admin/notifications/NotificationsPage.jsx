import { useState } from "react";
import { Bell, CheckCheck, Circle, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { ErrorState, LoadingState, toastSuccess, alertError } from "../../../components/ui";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppEmptyState from "../../../design-system/components/AppEmptyState";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import { useNotifications } from "../../../hooks/useApiQueries";
import useLanguage from "../../../i18n/useLanguage";

const filters = [
  ["all", "notifications.all"],
  ["unread", "notifications.unread"],
  ["orders", "notifications.orders"],
  ["payments", "notifications.payments"],
  ["system", "notifications.system"],
];

export default function NotificationsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const queryFilters = activeFilter === "unread" ? { filter: "unread" } : activeFilter === "all" ? {} : { category: activeFilter };
  const notificationsQuery = useNotifications({ ...queryFilters, per_page: 20 });
  const notifications = notificationsQuery.data?.notifications || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = useMutation({
    mutationFn: (id) => api.post(`/notifications/${id}/read`),
    onSuccess: invalidate,
    onError: (error) => alertError(error, t("notifications.markReadError", "Unable to mark notification as read.")),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: async () => {
      invalidate();
      await toastSuccess(t("notifications.markAllReadSuccess", "Notifications marked as read."));
    },
    onError: (error) => alertError(error, t("notifications.markAllReadError", "Unable to mark notifications as read.")),
  });

  return (
    <div className="grid gap-4">
      <AppPageHeader
        eyebrow={t("notifications.eyebrow", "Notification center")}
        title={t("notifications.title", "Notifications")}
        description={t("notifications.subtitle", "Review important activity from orders, payments, account, and system status.")}
        primaryAction={{
          children: t("notifications.markAllAsRead", "Mark all as read"),
          onClick: () => markAllRead.mutate(),
          loading: markAllRead.isPending,
          disabled: markAllRead.isPending || notifications.length === 0,
          iconLeft: <CheckCheck className="h-4 w-4" aria-hidden="true" />,
        }}
        secondaryActions={(
          <AppButton type="button" variant="secondary" onClick={() => notificationsQuery.refetch()} loading={notificationsQuery.isFetching} iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
            {t("common.refresh", "Refresh")}
          </AppButton>
        )}
      />

      <AppCard bodyClassName="grid gap-4 p-3 sm:p-4">
        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1" role="tablist" aria-label={t("notifications.filters", "Notification filters")}>
          {filters.map(([value, labelKey]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={activeFilter === value}
              className={`khmer-button min-h-10 shrink-0 rounded-xl px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeFilter === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70"}`}
              onClick={() => setActiveFilter(value)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {notificationsQuery.isLoading ? <LoadingState message={t("notifications.loading", "Loading notifications...")} /> : null}
        {notificationsQuery.isError ? <ErrorState message={t("notifications.loadError", "Unable to load notifications.")} onRetry={notificationsQuery.refetch} /> : null}
        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
          <AppEmptyState
            title={t("notifications.emptyTitle", "No notifications")}
            description={t("notifications.emptyDescription", "Real order, payment, and system notification logs will appear here after they are generated.")}
          />
        ) : null}

        {notifications.length ? (
          <div className="grid gap-3">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} t={t} onMarkRead={() => markRead.mutate(notification.id)} marking={markRead.isPending} />
            ))}
          </div>
        ) : null}
      </AppCard>
    </div>
  );
}

function NotificationCard({ notification, t, onMarkRead, marking }) {
  const unread = !notification.read_at;

  return (
    <article className={`rounded-3xl border p-4 ${unread ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${unread ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
          <Bell className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {unread ? <Circle className="h-2.5 w-2.5 fill-blue-600 text-blue-600" aria-label={t("notifications.unread", "Unread")} /> : null}
            <h2 className="khmer-heading text-base font-black text-slate-950">{notification.title}</h2>
            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black uppercase text-slate-500 ring-1 ring-slate-200">{notification.category}</span>
          </div>
          <p className="khmer-text mt-2 whitespace-pre-line text-sm font-medium leading-6 text-slate-600">{notification.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            {notification.shop?.name ? <span>{notification.shop.name}</span> : null}
            <span>{formatDateTime(notification.created_at)}</span>
            <span>{notification.status}</span>
          </div>
        </div>
        {unread ? (
          <AppButton type="button" size="sm" variant="secondary" disabled={marking} onClick={onMarkRead}>
            {t("notifications.markAsRead", "Mark as read")}
          </AppButton>
        ) : null}
      </div>
    </article>
  );
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
