import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useId } from "react";
import AppCard from "./AppCard";
import AppSkeleton from "./AppSkeleton";

export default function AppMetricCard({ title, value, icon: Icon, trend, description, loading = false, status }) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = description ? `${generatedId}-description` : undefined;

  return (
    <AppCard bodyClassName="p-4" aria-labelledby={titleId} aria-describedby={descriptionId}>
      {loading ? <AppSkeleton /> : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p id={titleId} className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
              {status ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">{status}</span> : null}
            </div>
            <p className="mt-3 text-2xl font-black tabular-nums text-slate-950">{value}</p>
            {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</p> : null}
            {trend ? (
              <p className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${trend.direction === "down" ? "text-rose-600" : "text-emerald-600"}`}>
                {trend.direction === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                {trend.label}
              </p>
            ) : null}
          </div>
          {Icon ? (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      )}
    </AppCard>
  );
}
