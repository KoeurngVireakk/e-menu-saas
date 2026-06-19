import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import AppButton from "./AppButton";
import AppCard from "./AppCard";

export default function AppEmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There is nothing to show yet.",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  checklist = [],
}) {
  return (
    <AppCard className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 text-blue-600 shadow-inner">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {checklist.length ? (
        <ul className="mx-auto mt-4 grid max-w-md gap-2 text-left text-sm font-semibold text-slate-600">
          {checklist.map((item) => (
            <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">{item}</li>
          ))}
        </ul>
      ) : null}
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {actionLabel && onAction ? (
            <AppButton type="button" onClick={onAction}>{actionLabel}</AppButton>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <AppButton type="button" variant="secondary" onClick={onSecondaryAction}>{secondaryActionLabel}</AppButton>
          ) : null}
        </div>
      ) : null}
      </motion.div>
    </AppCard>
  );
}
