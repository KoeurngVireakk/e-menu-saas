export default function OperationStatusTabs({ value, onChange, options }) {
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Filter by operation status">
      {options.map(([optionValue, label, count]) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(optionValue)}
            className={`khmer-button min-h-10 shrink-0 rounded-xl px-3 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}
          >
            {label}
            {typeof count === "number" ? <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
