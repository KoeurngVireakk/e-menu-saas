import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router-dom";
import AppCard from "./AppCard";
import { cn } from "../../components/ui/utils";

const toneStyles = {
  default: {
    icon: "bg-blue-50 text-blue-600",
    status: "bg-blue-50 text-blue-700",
  },
  info: {
    icon: "bg-blue-50 text-blue-600",
    status: "bg-blue-50 text-blue-700",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-600",
    status: "bg-emerald-50 text-emerald-700",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700",
    status: "bg-amber-50 text-amber-800",
  },
  danger: {
    icon: "bg-rose-50 text-rose-600",
    status: "bg-rose-50 text-rose-700",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-600",
    status: "bg-slate-100 text-slate-700",
  },
};

export default function AppMetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  helperText,
  loading = false,
  status,
  tone = "default",
  actionLabel,
  actionTo,
  ariaLabel,
}) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = description || helperText ? `${generatedId}-description` : undefined;
  const styles = toneStyles[tone] || toneStyles.default;

  return (
    <AppCard
      className="h-full"
      bodyClassName="flex min-h-36 flex-col p-4"
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
    >
      {loading ? <MetricSkeleton /> : (
        <div className="flex h-full min-w-0 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p id={titleId} className="khmer-label text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
                {status ? <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-black leading-5", styles.status)}>{status}</span> : null}
              </div>
              <p className="mt-3 break-words text-2xl font-black leading-tight tabular-nums text-slate-950 sm:text-3xl">{value ?? "—"}</p>
            </div>
            {Icon ? (
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", styles.icon)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            ) : null}
          </div>
          <div className="mt-2 min-w-0 flex-1">
            {description ? <p id={descriptionId} className="khmer-text text-sm leading-6 text-slate-500">{description}</p> : null}
            {helperText ? <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-400">{helperText}</p> : null}
          </div>
          <div className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
            {trend ? (
              <p className={`inline-flex items-center gap-1 text-xs font-bold ${trend.direction === "down" ? "text-rose-600" : "text-emerald-600"}`}>
                {trend.direction === "down" ? <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
                {trend.label}
              </p>
            ) : <span aria-hidden="true" />}
            {actionLabel && actionTo ? (
              <Link to={actionTo} className="khmer-button text-xs font-black text-blue-700 underline-offset-4 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500">
                {actionLabel}
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </AppCard>
  );
}

function MetricSkeleton() {
  return (
    <div className="h-full animate-pulse" role="status" aria-label="Loading metric">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-4 h-8 w-32 rounded-xl bg-slate-200" />
        </div>
        <div className="h-11 w-11 rounded-2xl bg-slate-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
      </div>
      <span className="sr-only">Loading metric</span>
    </div>
  );
}
