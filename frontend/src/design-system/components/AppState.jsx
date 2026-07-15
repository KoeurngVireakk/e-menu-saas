import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Ban, CheckCircle2, Inbox, SearchX, WifiOff } from "lucide-react";
import { cn } from "../../components/ui/utils";
import AppButton from "./AppButton";
import AppCard from "./AppCard";

const kinds = {
  empty: { icon: Inbox, iconClass: "border-blue-100 bg-blue-50 text-blue-600", cardClass: "" },
  "no-results": { icon: SearchX, iconClass: "border-blue-100 bg-blue-50 text-blue-600", cardClass: "" },
  offline: { icon: WifiOff, iconClass: "border-amber-200 bg-amber-50 text-amber-700", cardClass: "border-amber-200 bg-amber-50/30" },
  permission: { icon: Ban, iconClass: "border-slate-200 bg-slate-100 text-slate-600", cardClass: "border-slate-200 bg-slate-50/60" },
  error: { icon: AlertTriangle, iconClass: "border-rose-200 bg-rose-50 text-rose-700", cardClass: "border-rose-200 bg-rose-50/40" },
  success: { icon: CheckCircle2, iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700", cardClass: "border-emerald-200 bg-emerald-50/40" },
};

export default function AppState({
  kind = "empty",
  icon,
  title,
  description,
  message,
  details,
  action,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  checklist = [],
  checklistLabel = "Suggested next steps",
  contained = true,
  className = "",
}) {
  const reduceMotion = useReducedMotion();
  const config = kinds[kind] || kinds.empty;
  const Icon = icon || config.icon;
  const content = (
    <motion.div
      className="min-w-0 text-center"
      role={kind === "error" ? "alert" : undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      data-ui-motion
    >
      <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-3xl border shadow-inner shadow-white", config.iconClass)}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="khmer-heading mt-4 text-lg font-black leading-7 text-slate-950">{title}</h3>
      <p className="khmer-text mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description || message}</p>
      {details ? <p className="khmer-text mx-auto mt-1 max-w-md text-xs font-semibold leading-5 text-slate-500">{details}</p> : null}
      {checklist.length ? (
        <ul className="khmer-text mx-auto mt-4 grid max-w-md gap-2 text-left text-sm font-semibold leading-6 text-slate-600" aria-label={checklistLabel}>
          {checklist.map((item) => <li key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">{item}</li>)}
        </ul>
      ) : null}
      {action || (actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
          {action}
          {actionLabel && onAction ? <AppButton type="button" className="w-full sm:w-auto" variant={kind === "error" ? "danger" : "primary"} onClick={onAction}>{actionLabel}</AppButton> : null}
          {secondaryActionLabel && onSecondaryAction ? <AppButton type="button" variant="secondary" className="w-full sm:w-auto" onClick={onSecondaryAction}>{secondaryActionLabel}</AppButton> : null}
        </div>
      ) : null}
    </motion.div>
  );

  if (!contained) return <div className={cn("px-3 py-8 sm:px-4", className)}>{content}</div>;

  return <AppCard className={cn("text-center", config.cardClass, className)}>{content}</AppCard>;
}
