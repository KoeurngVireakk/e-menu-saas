const tone = {
  active: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  ready: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  accepted: "bg-indigo-100 text-indigo-700",
  inactive: "bg-slate-100 text-slate-600",
  unpaid: "bg-slate-100 text-slate-600",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-rose-100 text-rose-700",
  suspended: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone[value] || "bg-slate-100 text-slate-600"}`}>
      {value || "unknown"}
    </span>
  );
}
