import { AnimatePresence, motion } from "framer-motion";

export default function Drawer({ open = true, children, className = "" }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-2xl ${className}`}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 360, damping: 36 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
