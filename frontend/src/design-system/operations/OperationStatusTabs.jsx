export default function OperationStatusTabs({ value, onChange, options }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {options.map(([optionValue, label, count]) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`shrink-0 rounded-xl px-3 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
          >
            {label}
            {typeof count === "number" ? <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
