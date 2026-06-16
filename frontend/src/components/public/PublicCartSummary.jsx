import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { AppButton, AppCard } from "../../design-system/components";
import { itemTotal, money, optionSummary, unitPrice } from "../../utils/cart";
import { t } from "../../utils/localization";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function PublicCartSummary({ cart, locale, onQuantity, onRemove }) {
  return (
    <div className="grid gap-3">
      {cart.map((item) => {
        const imageUrl = item.image_path ? `${storageUrl}/${item.image_path}` : null;

        return (
          <motion.div key={item.key} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <AppCard bodyClassName="p-3">
              <div className="flex gap-3">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-semibold text-slate-400">
                  {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt={item.name} /> : "Image"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{item.name}</p>
                      {optionSummary(item) ? <p className="mt-1 text-sm leading-5 text-slate-500">{optionSummary(item)}</p> : null}
                      {item.note ? <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">{item.note}</p> : null}
                      <p className="mt-1 text-sm text-slate-500">{money(unitPrice(item))} KHR {t(locale, "each")}</p>
                    </div>
                    <p className="shrink-0 font-black text-blue-700">{money(itemTotal(item))} KHR</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AppButton type="button" variant="secondary" size="sm" aria-label={`Decrease quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity - 1)}><Minus className="h-4 w-4" /></AppButton>
                      <span className="w-8 text-center font-black">{item.quantity}</span>
                      <AppButton type="button" variant="secondary" size="sm" aria-label={`Increase quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity + 1)}><Plus className="h-4 w-4" /></AppButton>
                    </div>
                    <AppButton type="button" variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-50" iconLeft={<Trash2 className="h-4 w-4" />} onClick={() => onRemove(item.key)}>{t(locale, "remove")}</AppButton>
                  </div>
                </div>
              </div>
            </AppCard>
          </motion.div>
        );
      })}
    </div>
  );
}
