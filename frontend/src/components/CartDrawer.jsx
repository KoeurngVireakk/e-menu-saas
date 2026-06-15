import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AppButton, AppEmptyState } from "../design-system/components";
import { cartTotal, itemTotal, money, optionSummary, unitPrice } from "../utils/cart";
import { getPreferredLocale, t } from "../utils/localization";
import { Drawer } from "./ui";

export default function CartDrawer({ cart, onQuantity, onRemove, onCheckout, locale = getPreferredLocale() }) {
  const total = cartTotal(cart);

  return (
    <Drawer className="rounded-t-3xl p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{cart.length} {t(locale, "itemTypes")}</p>
            <p className="text-xl font-black text-slate-950">{money(total)} KHR</p>
          </div>
          <AppButton type="button" disabled={!cart.length} iconLeft={<ShoppingCart className="h-4 w-4" />} onClick={onCheckout}>{t(locale, "checkout")}</AppButton>
        </div>
        {cart.length ? (
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto">
            {cart.map((item) => (
              <motion.div
                key={item.key}
                className="rounded-2xl bg-slate-50 p-3 text-sm"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {optionSummary(item) ? <p className="mt-0.5 text-xs text-slate-500">{optionSummary(item)}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">{money(unitPrice(item))} KHR {t(locale, "each")}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-blue-700">{money(itemTotal(item))} KHR</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AppButton type="button" variant="secondary" size="sm" aria-label={`Decrease quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity - 1)}><Minus className="h-4 w-4" /></AppButton>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <AppButton type="button" variant="secondary" size="sm" aria-label={`Increase quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity + 1)}><Plus className="h-4 w-4" /></AppButton>
                  </div>
                  <AppButton type="button" variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-50" iconLeft={<Trash2 className="h-4 w-4" />} onClick={() => onRemove(item.key)}>{t(locale, "remove")}</AppButton>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <AppEmptyState title={t(locale, "cartEmpty")} description={t(locale, "chooseProduct")} />
          </div>
        )}
      </div>
    </Drawer>
  );
}
