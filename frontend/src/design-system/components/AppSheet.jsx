import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../components/ui/utils";
import useDialogA11y from "../hooks/useDialogA11y";

export default function AppSheet({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  side = "right",
  size = "md",
  bodyClassName = "",
  closeLabel = "Close panel",
  loading = false,
  dismissible = true,
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useDialogA11y({ open, dialogRef: panelRef, onClose, closeDisabled: loading || !dismissible });

  if (!open) return null;

  const position = side === "left" ? "left-0" : "right-0";
  const widths = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[var(--menudigi-overlay)] backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible && !loading) onClose?.();
      }}
    >
      <aside
        ref={panelRef}
        className={`absolute top-0 ${position} premium-surface flex h-dvh w-full min-w-0 ${widths[size] || widths.md} flex-col overflow-hidden border border-white/80 bg-white shadow-xl sm:my-3 sm:h-[calc(100dvh-1.5rem)] sm:rounded-3xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={loading || undefined}
        tabIndex={-1}
      >
        <header className="premium-divider flex items-start justify-between gap-4 border-b px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <h2 id={titleId} className="khmer-heading text-lg font-black text-slate-950">{title}</h2>
            {description ? <p id={descriptionId} className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            disabled={loading || !dismissible}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className={cn("min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-5", bodyClassName)}>{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-slate-100 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
