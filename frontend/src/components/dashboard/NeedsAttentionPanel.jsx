import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { AppCard } from "../../design-system/components";
import { cn } from "../ui/utils";

const toneStyles = {
  danger: {
    icon: ShieldAlert,
    wrapper: "border-rose-200 bg-rose-50/60",
    iconClass: "bg-white text-rose-600 ring-rose-100",
    action: "text-rose-700",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-amber-200 bg-amber-50/60",
    iconClass: "bg-white text-amber-700 ring-amber-100",
    action: "text-amber-800",
  },
  info: {
    icon: Info,
    wrapper: "border-blue-200 bg-blue-50/60",
    iconClass: "bg-white text-blue-700 ring-blue-100",
    action: "text-blue-700",
  },
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50/60",
    iconClass: "bg-white text-emerald-700 ring-emerald-100",
    action: "text-emerald-700",
  },
  neutral: {
    icon: Info,
    wrapper: "border-slate-200 bg-slate-50",
    iconClass: "bg-white text-slate-600 ring-slate-100",
    action: "text-slate-700",
  },
};

export default function NeedsAttentionPanel({
  title,
  description,
  items = [],
  emptyTitle,
  emptyDescription,
}) {
  return (
    <AppCard title={title} description={description} labelled>
      {items.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((item) => <AttentionItem key={item.title} item={item} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm shadow-emerald-900/[0.03]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="khmer-heading font-black leading-6 text-slate-950">{emptyTitle}</p>
              <p className="khmer-text mt-1 text-sm leading-6 text-slate-600">{emptyDescription}</p>
            </div>
          </div>
        </div>
      )}
    </AppCard>
  );
}

function AttentionItem({ item }) {
  const styles = toneStyles[item.tone] || toneStyles.info;
  const Icon = styles.icon;
  const content = (
    <>
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1", styles.iconClass)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="khmer-heading block font-black leading-6 text-slate-950">{item.title}</span>
        <span className="khmer-text mt-1 block text-sm leading-6 text-slate-600">{item.description}</span>
        {item.actionLabel ? <span className={cn("khmer-button mt-3 inline-flex text-sm font-black", styles.action)}>{item.actionLabel}</span> : null}
      </span>
    </>
  );

  const className = cn(
    "flex min-h-32 items-start gap-3 rounded-3xl border p-4 text-left shadow-sm shadow-slate-900/[0.03] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    item.href ? "premium-interactive" : "",
    styles.wrapper,
  );

  if (item.href) {
    return <Link to={item.href} className={className} aria-label={item.actionLabel ? `${item.title}: ${item.actionLabel}` : item.title}>{content}</Link>;
  }

  if (item.onClick) {
    return <button type="button" className={className} onClick={item.onClick}>{content}</button>;
  }

  return <div className={className}>{content}</div>;
}
