import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import AppButton from "./AppButton";
import AppCard from "./AppCard";
import { cn } from "../../components/ui/utils";

export default function AppEmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There is nothing to show yet.",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  checklist = [],
  contained = true,
  className = "",
}) {
  const content = (
    <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-slate-100 text-blue-600 shadow-inner">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="khmer-heading mt-4 text-lg font-black leading-7 text-slate-950">{title}</h3>
      <p className="khmer-text mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {checklist.length ? (
        <ul className="khmer-text mx-auto mt-4 grid max-w-md gap-2 text-left text-sm font-semibold leading-6 text-slate-600" aria-label="Suggested next steps">
          {checklist.map((item) => (
            <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">{item}</li>
          ))}
        </ul>
      ) : null}
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
          {actionLabel && onAction ? (
            <AppButton type="button" className="w-full sm:w-auto" onClick={onAction}>{actionLabel}</AppButton>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <AppButton type="button" variant="secondary" className="w-full sm:w-auto" onClick={onSecondaryAction}>{secondaryActionLabel}</AppButton>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );

  if (!contained) return <div className={cn("px-3 py-8 sm:px-4", className)}>{content}</div>;

  return <AppCard className={cn("text-center", className)}>{content}</AppCard>;
}
