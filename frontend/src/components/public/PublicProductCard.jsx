import { motion } from "framer-motion";
import { Clock, Plus, Star } from "lucide-react";
import { AppBadge, AppButton } from "../../design-system/components";
import { t } from "../../utils/localization";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function PublicProductCard({ product, locale = "en", onAdd, onView }) {
  const imageUrl = product.image_path ? `${storageUrl}/${product.image_path}` : null;
  const available = product.is_available !== false;
  const price = Number(product.discount_price || product.price).toLocaleString();

  return (
    <motion.article
      className={`premium-interactive group grid grid-cols-[108px_1fr] gap-3 rounded-[1.6rem] border bg-white p-3 shadow-sm shadow-slate-900/5 ring-1 ring-white/70 transition sm:grid-cols-[124px_1fr] ${
        available ? "border-slate-200/80 hover:border-blue-200" : "border-slate-200 opacity-70"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileTap={available ? { scale: 0.99 } : undefined}
    >
      <button type="button" onClick={() => onView(product)} className="relative h-32 overflow-hidden rounded-3xl bg-slate-100 shadow-inner transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:shadow-slate-900/10" aria-label={locale === "en" ? `View ${product.name}` : `មើល ${product.name}`}>
        {imageUrl ? (
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={imageUrl} alt={product.name} loading="lazy" decoding="async" />
        ) : (
          <span className="khmer-label grid h-full place-items-center px-2 text-center text-xs font-black text-slate-400">{t(locale, "noImage")}</span>
        )}
      </button>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={() => onView(product)} className="khmer-heading block text-left text-base font-black leading-snug text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {product.name}
          </button>
          {product.is_featured ? <AppBadge status="warning"><Star className="mr-1 h-3 w-3" aria-hidden="true" />{t(locale, "featured")}</AppBadge> : null}
        </div>
        <p className="khmer-text mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
        {product.preparation_time ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{product.preparation_time} {t(locale, "minuteShort")}</p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            {product.discount_price ? <p className="text-xs text-slate-400 line-through">{Number(product.price).toLocaleString()} KHR</p> : null}
            <p className="text-lg font-black text-blue-700">{price} KHR</p>
          </div>
          {available ? (
            <AppButton type="button" size="md" className="min-w-24 shadow-blue-600/20" aria-label={locale === "en" ? `Add ${product.name} to cart` : `${t(locale, "addToCart")} ${product.name}`} iconLeft={<Plus className="h-4 w-4" />} onClick={() => onAdd(product)}>{t(locale, "addToCart")}</AppButton>
          ) : (
            <AppBadge status="danger">{t(locale, "soldOut")}</AppBadge>
          )}
        </div>
      </div>
    </motion.article>
  );
}
