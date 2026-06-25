import { cn } from "../../components/ui/utils";

const statusTones = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  accepted: "border-blue-200 bg-blue-50 text-blue-700",
  preparing: "border-indigo-200 bg-indigo-50 text-indigo-700",
  ready: "border-cyan-200 bg-cyan-50 text-cyan-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  unpaid: "border-slate-200 bg-slate-100 text-slate-600",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

export default function AppBadge({ children, status = "info", className = "" }) {
  return (
    <span className={cn("khmer-text inline-flex items-center rounded-full border px-3 py-1 text-xs font-black shadow-sm shadow-slate-900/5", statusTones[status] || statusTones.info, className)}>
      {children || String(status).replaceAll("_", " ")}
    </span>
  );
}
