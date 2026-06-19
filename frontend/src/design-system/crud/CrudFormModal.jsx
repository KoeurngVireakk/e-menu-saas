import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../components/ui/utils";
import AppButton from "../components/AppButton";

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
}) {
  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 backdrop-blur-[3px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "flex max-h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-slate-950/25 outline-none",
          "sm:max-h-[calc(100vh-3rem)]",
          maxWidth,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">Form</p>
            <h2 id={titleId} className="mt-1 text-xl font-black leading-7 text-slate-950">{title}</h2>
            {description ? <p id={descriptionId} className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <form id={formId} onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid content-start gap-4">{children}</div>
        </form>
        <footer className="sticky bottom-0 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton type="button" variant="secondary" onClick={onClose}>{cancelLabel}</AppButton>
            <AppButton type="submit" form={formId} loading={loading} disabled={disabled}>{submitLabel}</AppButton>
          </div>
        </footer>
      </motion.section>
    </div>,
    document.body,
  );
}
