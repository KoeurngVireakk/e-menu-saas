import { Eye, EyeOff, MessageSquareText, RotateCcw, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { ErrorState, LoadingState, Select, alertError, confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import AppBadge from "../../../design-system/components/AppBadge";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppEmptyState from "../../../design-system/components/AppEmptyState";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import { useShopReviews } from "../../../hooks/useApiQueries";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import useLanguage from "../../../i18n/useLanguage";
import { queryKeys } from "../../../lib/queryKeys";
import { canManageReviews } from "../../../utils/permissions";
import { useQueryClient } from "@tanstack/react-query";

export default function ReviewsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const allowManage = canManageReviews(user);
  const { data: shops = [], isLoading: shopsLoading, error: shopsError } = useShopsQuery();
  const [shopId, setShopId] = useState("");
  const [filters, setFilters] = useState({ rating: "", status: "", date_from: "", date_to: "" });
  const [updatingId, setUpdatingId] = useState(null);
  const statusOptions = useMemo(() => [
    ["", t("reviews.allStatuses", "All statuses")],
    ["visible", t("reviews.statuses.visible", "Visible")],
    ["hidden", t("reviews.statuses.hidden", "Hidden")],
    ["reviewed", t("reviews.statuses.reviewed", "Reviewed")],
  ], [t]);
  const ratingOptions = useMemo(() => [
    ["", t("reviews.allRatings", "All ratings")],
    ["5", t("reviews.ratingOption5", "5 stars")],
    ["4", t("reviews.ratingOption4", "4 stars")],
    ["3", t("reviews.ratingOption3", "3 stars")],
    ["2", t("reviews.ratingOption2", "2 stars")],
    ["1", t("reviews.ratingOption1", "1 star")],
  ], [t]);

  useEffect(() => {
    if (shops.length && !shopId) {
      const timer = window.setTimeout(() => setShopId(shops[0].id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [shopId, shops]);

  const activeFilters = useMemo(() => filters, [filters]);
  const reviewsQuery = useShopReviews(shopId, activeFilters, { enabled: Boolean(shopId) });
  const reviews = reviewsQuery.data?.reviews || [];
  const summary = reviewsQuery.data?.summary || {};
  const pagination = reviewsQuery.data?.pagination;
  const loading = shopsLoading || (reviewsQuery.isLoading && !reviewsQuery.data);
  const loadError = shopsError || reviewsQuery.error;
  const hasFilters = Object.values(filters).some(Boolean);

  const updateStatus = async (review, status) => {
    const confirmed = await confirmAction(
      t("reviews.confirmStatusTitle", "Update review status?"),
      t(`reviews.confirmStatus.${status}`, "This changes how the review is moderated."),
    );

    if (!confirmed) return;

    setUpdatingId(review.id);
    try {
      await api.put(`/reviews/${review.id}/status`, { status });
      await queryClient.invalidateQueries({ queryKey: queryKeys.shopReviews(shopId, activeFilters) });
      await toastSuccess(t("reviews.statusUpdated", "Review status updated."));
    } catch (error) {
      alertError(error, t("reviews.statusUpdateError", "Unable to update review status."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !shopId) {
    return <LoadingState message={t("reviews.loading", "Loading reviews...")} />;
  }

  if (loadError && !reviewsQuery.data) {
    return <ErrorState message={t("reviews.loadError", "Unable to load reviews.")} onRetry={reviewsQuery.refetch} />;
  }

  if (!shopsLoading && !shops.length) {
    return <AppEmptyState title={t("reviews.noShopTitle", "Create a shop before managing reviews")} description={t("reviews.noShopDescription", "Reviews are scoped to a real restaurant workspace and completed customer orders.")} />;
  }

  return (
    <div className="grid gap-4">
      <AppPageHeader
        eyebrow={t("reviews.eyebrow", "Customer feedback")}
        title={t("reviews.title", "Reviews")}
        description={t("reviews.subtitle", "View real customer reviews submitted after completed paid orders.")}
        secondaryActions={!allowManage ? <AppBadge status="warning">{t("reviews.viewOnly", "View only")}</AppBadge> : null}
      />

      <AppCard bodyClassName="grid gap-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,320px)_1fr] lg:items-end">
          <Select label={t("common.shop", "Shop")} value={shopId} onChange={(event) => setShopId(event.target.value)} options={shops.map((shop) => [shop.id, shop.name])} />
          <div className="grid gap-2 sm:grid-cols-4">
            <Select label={t("reviews.rating", "Rating")} value={filters.rating} onChange={(event) => setFilters({ ...filters, rating: event.target.value })} options={ratingOptions} />
            <Select label={t("reviews.status", "Status")} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} options={statusOptions} />
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              {t("reviews.dateFrom", "From")}
              <input type="date" value={filters.date_from} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              {t("reviews.dateTo", "To")}
              <input type="date" value={filters.date_to} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>
        </div>
        {hasFilters ? (
          <AppButton type="button" variant="secondary" className="w-fit" iconLeft={<RotateCcw className="h-4 w-4" aria-hidden="true" />} onClick={() => setFilters({ rating: "", status: "", date_from: "", date_to: "" })}>
            {t("reviews.clearFilters", "Clear filters")}
          </AppButton>
        ) : null}
      </AppCard>

      <section className="grid gap-3 sm:grid-cols-4" aria-label={t("reviews.summary", "Review summary")}>
        <Metric label={t("reviews.averageRating", "Average rating")} value={summary.average_rating ? summary.average_rating.toFixed?.(1) || summary.average_rating : "0.0"} helper={t("reviews.averageRatingHelp", "From visible and moderated reviews")} />
        <Metric label={t("reviews.totalReviews", "Total reviews")} value={summary.count || 0} />
        <Metric label={t("reviews.visible", "Visible")} value={summary.visible_count || 0} />
        <Metric label={t("reviews.hidden", "Hidden")} value={summary.hidden_count || 0} />
      </section>

      <AppCard bodyClassName="p-0">
        {!reviews.length ? (
          <div className="p-6">
            <AppEmptyState
              title={hasFilters ? t("reviews.noResultsTitle", "No reviews match these filters") : t("reviews.emptyTitle", "No reviews yet")}
              description={hasFilters ? t("reviews.noResultsDescription", "Clear filters to review all customer feedback for this shop.") : t("reviews.emptyDescription", "Reviews appear here after customers submit feedback for completed paid orders.")}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {reviews.map((review) => (
              <article key={review.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={review.rating} label={t("reviews.starRatingLabel", "Rating")} />
                    <ReviewStatus status={review.status} label={t(`reviews.statuses.${review.status}`, review.status)} />
                    {review.order?.order_number ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{review.order.order_number}</span> : null}
                    <span className="text-xs font-bold text-slate-400">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="khmer-text mt-3 text-sm font-semibold leading-6 text-slate-700">{review.comment || t("reviews.noComment", "No written comment.")}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">{review.branch?.name || t("reviews.allBranches", "All branches")}</p>
                </div>
                {allowManage ? (
                  <div className="grid gap-2 sm:flex">
                    {review.status !== "visible" ? <AppButton type="button" size="sm" variant="secondary" loading={updatingId === review.id} iconLeft={<Eye className="h-4 w-4" />} onClick={() => updateStatus(review, "visible")}>{t("reviews.makeVisible", "Show")}</AppButton> : null}
                    {review.status !== "hidden" ? <AppButton type="button" size="sm" variant="secondary" loading={updatingId === review.id} iconLeft={<EyeOff className="h-4 w-4" />} onClick={() => updateStatus(review, "hidden")}>{t("reviews.hide", "Hide")}</AppButton> : null}
                    {review.status !== "reviewed" ? <AppButton type="button" size="sm" loading={updatingId === review.id} iconLeft={<MessageSquareText className="h-4 w-4" />} onClick={() => updateStatus(review, "reviewed")}>{t("reviews.markReviewed", "Mark reviewed")}</AppButton> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </AppCard>
      {pagination?.total ? <p className="text-sm font-semibold text-slate-500">{t("reviews.paginationSummary", "Showing")} {pagination.from}-{pagination.to} / {pagination.total}</p> : null}
    </div>
  );
}

function Metric({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
      <p className="khmer-label text-xs font-black text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      {helper ? <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function RatingStars({ rating, label }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${label}: ${rating}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} className={`h-4 w-4 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} aria-hidden="true" />
      ))}
    </div>
  );
}

function ReviewStatus({ status, label }) {
  const badgeStatus = status === "visible" ? "success" : status === "hidden" ? "warning" : "info";
  return <AppBadge status={badgeStatus}>{label}</AppBadge>;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
