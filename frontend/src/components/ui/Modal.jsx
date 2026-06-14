import { AnimatePresence, motion } from "framer-motion";
import Button from "./Button";

export default function Modal({ open, title, children, footer, onClose, className = "" }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 grid place-items-end bg-slate-950/55 p-3 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className={`max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl ${className}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {title || onClose ? (
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
                {title ? <h2 className="text-lg font-bold text-slate-950">{title}</h2> : <span />}
                {onClose ? <Button type="button" variant="secondary" size="sm" onClick={onClose}>Close</Button> : null}
              </div>
            ) : null}
            <div>{children}</div>
            {footer ? <div className="border-t border-slate-100 p-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
