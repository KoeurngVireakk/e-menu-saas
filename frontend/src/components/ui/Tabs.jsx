import { cn } from "./utils";

export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            String(active) === String(tab.value) ? "bg-slate-950 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
