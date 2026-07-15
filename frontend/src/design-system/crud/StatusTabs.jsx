const defaultStatuses = [
  ["all", "All"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

export default function StatusTabs({ value, onChange, options = defaultStatuses }) {
  return (
    <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Filter by status">
      {options.map(([optionValue, label]) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(optionValue)}
            className={`khmer-button min-h-10 shrink-0 rounded-xl px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/70 hover:text-slate-950"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
