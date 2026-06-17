import { Inbox } from "lucide-react";
import AppButton from "./AppButton";
import AppCard from "./AppCard";

export default function AppEmptyState({ icon: Icon = Inbox, title = "No records found", description = "There is nothing to show yet.", actionLabel, onAction }) {
  return (
    <AppCard className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 text-blue-600 shadow-inner">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <AppButton type="button" className="mt-5" onClick={onAction}>{actionLabel}</AppButton>
      ) : null}
    </AppCard>
  );
}
