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
            <AppCard className="premium-interactive" bodyClassName="p-3">
              <div className="flex gap-3">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-semibold text-slate-400">
                  {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt={item.name} /> : "Image"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="khmer-heading font-black text-slate-950">{item.name}</p>
                      {optionSummary(item) ? <p className="khmer-text mt-1 text-sm leading-6 text-slate-500">{optionSummary(item)}</p> : null}
                      {item.note ? <p className="khmer-text mt-1 rounded-xl bg-amber-50 px-2 py-1 text-xs font-semibold leading-5 text-amber-800">{item.note}</p> : null}
                      <p className="mt-1 text-sm font-semibold text-slate-500">{money(unitPrice(item))} KHR {t(locale, "each")}</p>
                    </div>
                    <p className="shrink-0 font-black text-blue-700">{money(itemTotal(item))} KHR</p>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                      <AppButton type="button" variant="ghost" size="sm" aria-label={`Decrease quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity - 1)}><Minus className="h-4 w-4" /></AppButton>
                      <span className="min-w-10 text-center font-black text-slate-950">{item.quantity}</span>
                      <AppButton type="button" variant="ghost" size="sm" aria-label={`Increase quantity for ${item.name}`} onClick={() => onQuantity(item.key, item.quantity + 1)}><Plus className="h-4 w-4" /></AppButton>
                    </div>
                    <AppButton type="button" variant="ghost" size="sm" className="w-full text-rose-700 hover:bg-rose-50 sm:w-auto" iconLeft={<Trash2 className="h-4 w-4" />} onClick={() => onRemove(item.key)}>{t(locale, "remove")}</AppButton>
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
