import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Button from "./Button";

export default function Modal({ open, title, children, footer, onClose, className = "" }) {
  useEffect(() => {
    if (!open || !onClose) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 grid place-items-end bg-slate-950/60 p-3 backdrop-blur-sm sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className={`max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-4xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-4xl ${className}`}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog"}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {title || onClose ? (
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 p-4 backdrop-blur">
                {title ? <h2 className="text-lg font-bold text-slate-950">{title}</h2> : <span />}
                {onClose ? <Button type="button" variant="secondary" size="sm" onClick={onClose}>Close</Button> : null}
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
