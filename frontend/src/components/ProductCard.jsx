export default function ProductCard({ product, onAdd, onView }) {
  const imageUrl = product.image_path
    ? `${import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage"}/${product.image_path}`
    : null;

  return (
    <article className="grid grid-cols-[88px_1fr] gap-3 rounded-md border border-slate-200 bg-white p-3">
      <button onClick={() => onView(product)} className="h-24 overflow-hidden rounded-md bg-slate-100">
        {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt={product.name} /> : <span className="grid h-full place-items-center text-xs text-slate-400">Image</span>}
      </button>
      <div className="min-w-0">
        <button onClick={() => onView(product)} className="block text-left font-semibold text-slate-950">{product.name}</button>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-bold text-orange-700">{Number(product.discount_price || product.price).toLocaleString()} KHR</p>
          <button onClick={() => onAdd(product)} className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white">Add</button>
        </div>
      </div>
    </article>
  );
}
