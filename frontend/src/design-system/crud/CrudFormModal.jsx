import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../components/ui/utils";
import AppButton from "../components/AppButton";
import useDialogA11y from "../hooks/useDialogA11y";

export default function CrudFormModal({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
  maxWidth = "max-w-xl",
  closeLabel = "Close form",
  eyebrow = "Form",
}) {
  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useDialogA11y({ open, dialogRef, onClose, closeDisabled: loading });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-end overflow-hidden bg-[var(--menudigi-overlay)] px-[max(0.5rem,env(safe-area-inset-left))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-[4px] sm:place-items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose?.();
      }}
    >
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={loading || undefined}
        tabIndex={-1}
        initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        data-ui-motion
        className={cn(
          "premium-surface flex max-h-[calc(100dvh-1rem)] w-full min-w-0 flex-col overflow-hidden rounded-t-3xl border border-white/80 bg-white shadow-[var(--menudigi-elevated-shadow)] outline-none sm:rounded-3xl",
          "sm:max-h-[calc(100dvh-3rem)]",
          maxWidth,
        )}
      >
        <header className="premium-divider flex items-start justify-between gap-4 border-b bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="khmer-label text-xs font-black text-blue-600">{eyebrow}</p>
            <h2 id={titleId} className="khmer-heading mt-1 text-xl font-black leading-7 text-slate-950">{title}</h2>
            {description ? <p id={descriptionId} className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            disabled={loading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <form id={formId} onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid content-start gap-4 sm:gap-5">{children}</div>
        </form>
        <footer className="sticky bottom-0 border-t border-slate-100 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 sm:pb-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>{cancelLabel}</AppButton>
            <AppButton type="submit" form={formId} className="w-full sm:w-auto" loading={loading} disabled={disabled}>{submitLabel}</AppButton>
          </div>
        </footer>
      </motion.section>
    </div>,
    document.body,
  );
}
