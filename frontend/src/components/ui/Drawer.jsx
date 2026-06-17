import { AnimatePresence, motion } from "framer-motion";

export default function Drawer({ open = true, children, className = "" }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl ${className}`}
          role="complementary"
          aria-label="Cart summary"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
