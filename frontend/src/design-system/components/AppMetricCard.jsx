import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import AppCard from "./AppCard";
import AppSkeleton from "./AppSkeleton";

export default function AppMetricCard({ title, value, icon: Icon, trend, description, loading = false }) {
  return (
    <AppCard bodyClassName="p-4">
      {loading ? <AppSkeleton /> : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
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
