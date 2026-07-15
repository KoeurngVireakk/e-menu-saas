import { Grid2X2, List } from "lucide-react";

const views = [
  ["table", List, "Table"],
  ["grid", Grid2X2, "Grid"],
];

export default function DataViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label="Data view">
      {views.map(([view, Icon, label]) => {
        const active = value === view;
        return (
          <button
            key={view}
            type="button"
            aria-label={`${label} view`}
            aria-pressed={active}
            onClick={() => onChange(view)}
            className={`grid h-10 w-10 place-items-center rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
