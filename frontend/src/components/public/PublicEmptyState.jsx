import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { AppButton } from "../../design-system/components";

export default function PublicEmptyState({ title, description, actionLabel, onAction, icon: Icon = ShoppingBag }) {
  return (
    <motion.div
      className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      {actionLabel && onAction ? (
        <AppButton type="button" className="mt-4" onClick={onAction}>
          {actionLabel}
        </AppButton>
      ) : null}
    </motion.div>
  );
}
