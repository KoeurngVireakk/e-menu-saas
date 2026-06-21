import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, children, footer, onClose, className = "" }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open || !onClose) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 grid place-items-end overflow-hidden bg-slate-950/50 p-2 backdrop-blur-[3px] sm:place-items-center sm:p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
          <motion.div
            ref={dialogRef}
            className={`max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-lg overflow-y-auto overscroll-contain rounded-t-4xl border border-white/70 bg-white shadow-2xl shadow-slate-950/15 outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-4xl ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? "Dialog" : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {title || onClose ? (
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 p-4 backdrop-blur">
                {title ? <h2 id={titleId} className="khmer-heading text-lg font-black text-slate-950">{title}</h2> : <span />}
                {onClose ? <button type="button" aria-label="Close dialog" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={onClose}><X className="h-5 w-5" aria-hidden="true" /></button> : null}
              </div>
            ) : null}
            <div>{children}</div>
            {footer ? <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-14px_30px_rgba(15,23,42,0.06)] backdrop-blur">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
