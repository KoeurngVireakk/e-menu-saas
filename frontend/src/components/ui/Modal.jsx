import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useDialogA11y from "../../design-system/hooks/useDialogA11y";

export default function Modal({ open, title, description, children, footer, onClose, className = "", closeLabel = "Close dialog", loading = false, dismissible = true }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useDialogA11y({ open, dialogRef, onClose, closeDisabled: loading || !dismissible });

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end overflow-hidden bg-[var(--menudigi-overlay)] px-[max(0.5rem,env(safe-area-inset-left))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-[4px] sm:place-items-center sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget && dismissible && !loading) onClose?.(); }}
          data-ui-motion
        >
          <motion.div
            ref={dialogRef}
            className={`premium-surface max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-white/70 bg-white shadow-[var(--menudigi-elevated-shadow)] outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            aria-label={!title ? "Dialog" : undefined}
            aria-busy={loading || undefined}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            data-ui-motion
          >
            {title || description || onClose ? (
              <div className="premium-divider sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-white/95 p-4 backdrop-blur">
                <div className="min-w-0">
                  {title ? <h2 id={titleId} className="khmer-heading text-lg font-black leading-7 text-slate-950">{title}</h2> : null}
                  {description ? <p id={descriptionId} className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
                </div>
                {onClose ? <button type="button" aria-label={closeLabel} disabled={loading || !dismissible} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50" onClick={onClose}><X className="h-5 w-5" aria-hidden="true" /></button> : null}
              </div>
            ) : null}
            <div>{children}</div>
            {footer ? <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-14px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:pb-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
