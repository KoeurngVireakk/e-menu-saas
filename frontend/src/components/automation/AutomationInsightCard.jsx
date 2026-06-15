import { Sparkles } from "lucide-react";
import { AppButton, AppCard, AppSkeleton } from "../../design-system/components";

const tones = {
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export default function AutomationInsightCard({
  title,
  description,
  severity = "info",
  actionLabel,
  icon: Icon = Sparkles,
  loading = false,
  onAction,
}) {
  return (
    <AppCard bodyClassName="p-4">
      {loading ? <AppSkeleton /> : (
        <div className="flex items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tones[severity] || tones.info}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            {actionLabel ? (
              <AppButton type="button" variant="ghost" size="sm" className="mt-3 px-0" onClick={onAction}>
                {actionLabel}
              </AppButton>
            ) : null}
          </div>
        </div>
      )}
    </AppCard>
  );
}
