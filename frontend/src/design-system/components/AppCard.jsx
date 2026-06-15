import { cn } from "../../components/ui/utils";

export default function AppCard({ title, description, action, children, className = "", bodyClassName = "" }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || description || action) ? (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 md:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-black text-slate-950">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 md:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
