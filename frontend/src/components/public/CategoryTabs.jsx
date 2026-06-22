export default function CategoryTabs({ categories, active, counts = {}, onSelect }) {
  return (
    <nav className="sticky top-12 z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-y border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" aria-label="Menu categories">
      {categories.map((category) => {
        const selected = String(active) === String(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selected}
            className={`khmer-button min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
            }`}
          >
            {category.name}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[category.id] || 0}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
