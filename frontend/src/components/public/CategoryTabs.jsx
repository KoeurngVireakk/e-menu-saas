import { t } from "../../utils/localization";

export default function CategoryTabs({ categories, active, counts = {}, locale = "en", onSelect }) {
  return (
    <nav className="sticky top-12 z-20 -mx-4 mt-4 flex scroll-px-4 gap-2 overflow-x-auto border-y border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" aria-label={t(locale, "menuCategories")}>
      {categories.map((category) => {
        const selected = String(active) === String(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selected}
            aria-current={selected ? "true" : undefined}
            className={`khmer-button min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected ? "border-blue-700 bg-blue-700 text-white shadow-blue-900/15 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
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
