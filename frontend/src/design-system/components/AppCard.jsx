import { useId } from "react";
import { cn } from "../../components/ui/utils";

export default function AppCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "",
  ariaLabel,
  labelled = false,
  ...props
}) {
  const generatedId = useId();
  const titleId = title ? `${generatedId}-title` : undefined;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const shouldLabelPanel = labelled && titleId;

  return (
    <section
      className={cn("rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 ring-1 ring-white/70", className)}
      aria-labelledby={shouldLabelPanel ? titleId : undefined}
      aria-describedby={shouldLabelPanel ? descriptionId : undefined}
      aria-label={!title ? ariaLabel : undefined}
      {...props}
    >
      {(title || description || action) ? (
        <header className="flex flex-col gap-3 border-b border-slate-100/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-6">
          <div className="min-w-0">
            {title ? <h2 id={titleId} className="text-base font-black leading-6 text-slate-950">{title}</h2> : null}
            {description ? <p id={descriptionId} className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 md:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
