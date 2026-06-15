const defaultStatuses = [
  ["all", "All"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

export default function StatusTabs({ value, onChange, options = defaultStatuses }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {options.map(([optionValue, label]) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
