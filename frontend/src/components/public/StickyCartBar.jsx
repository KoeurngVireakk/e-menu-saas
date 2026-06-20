import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { AppButton } from "../../design-system/components";
import { cartTotal, money } from "../../utils/cart";
import { t } from "../../utils/localization";

export default function StickyCartBar({ cart, locale = "en", label = "View cart", helper = "Review items and checkout", onClick }) {
  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = cartTotal(cart);

  return (
    <AnimatePresence>
      {count ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="complementary"
          aria-label={t(locale, "cartSummary")}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-[1.75rem] border border-white/80 bg-white/95 p-3 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/70 backdrop-blur-xl">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">{count} {t(locale, count === 1 ? "item" : "items")}</p>
              <p className="text-lg font-black text-slate-950">{money(total)} KHR</p>
              <p className="text-xs font-semibold text-slate-500">{helper}</p>
            </div>
            <AppButton type="button" iconLeft={<ShoppingCart className="h-4 w-4" />} onClick={onClick}>
              {label}
            </AppButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
