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
  variant = "default",
  ...props
}) {
  const generatedId = useId();
  const titleId = title ? `${generatedId}-title` : undefined;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const shouldLabelPanel = labelled && titleId;

  const variants = {
    default: "premium-surface border bg-white",
    interactive: "premium-surface premium-interactive border bg-white",
    bordered: "border border-slate-200 bg-white shadow-none",
    elevated: "border border-white/80 bg-white shadow-[var(--menudigi-elevated-shadow)]",
    compact: "border border-slate-200 bg-white shadow-none",
  };

  return (
    <section
      className={cn("min-w-0 rounded-3xl", variants[variant] || variants.default, className)}
      aria-labelledby={shouldLabelPanel ? titleId : undefined}
      aria-describedby={shouldLabelPanel ? descriptionId : undefined}
      aria-label={!title ? ariaLabel : undefined}
      {...props}
    >
      {(title || description || action) ? (
        <header className="premium-divider flex min-w-0 flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-6">
          <div className="min-w-0">
            {title ? <h2 id={titleId} className="khmer-heading text-base font-black leading-6 text-slate-950">{title}</h2> : null}
            {description ? <p id={descriptionId} className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="flex min-w-0 shrink-0 flex-wrap gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("min-w-0", variant === "compact" ? "p-4" : "p-4 md:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
