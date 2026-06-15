import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { AppBadge, AppButton } from "../design-system/components";

export default function ProductCard({ product, onAdd, onView }) {
  const imageUrl = product.image_path
    ? `${import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage"}/${product.image_path}`
    : null;
  const available = product.is_available !== false;
  const price = Number(product.discount_price || product.price).toLocaleString();

  return (
    <motion.article
      className={`grid grid-cols-[96px_1fr] gap-3 rounded-2xl border bg-white p-3 shadow-sm transition ${
        available ? "border-slate-200 hover:border-blue-200 hover:shadow-md" : "border-slate-200 opacity-70"
      }`}
      whileHover={available ? { y: -2 } : undefined}
      whileTap={available ? { scale: 0.99 } : undefined}
    >
      <button type="button" onClick={() => onView(product)} className="h-28 overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        {imageUrl ? (
          <img className="h-full w-full object-cover transition duration-300 hover:scale-105" src={imageUrl} alt={product.name} />
        ) : (
          <span className="grid h-full place-items-center text-xs font-semibold text-slate-400">Image</span>
        )}
      </button>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={() => onView(product)} className="block text-left font-bold leading-snug text-slate-950">
            {product.name}
          </button>
          {product.is_featured ? <AppBadge status="warning"><Star className="mr-1 h-3 w-3" aria-hidden="true" /> Featured</AppBadge> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            {product.discount_price ? <p className="text-xs text-slate-400 line-through">{Number(product.price).toLocaleString()} KHR</p> : null}
            <p className="font-black text-blue-700">{price} KHR</p>
          </div>
          {available ? (
            <AppButton type="button" size="sm" iconLeft={<Plus className="h-4 w-4" />} onClick={() => onAdd(product)}>Add</AppButton>
          ) : (
            <AppBadge status="danger">Sold out</AppBadge>
          )}
        </div>
      </div>
    </motion.article>
  );
}
