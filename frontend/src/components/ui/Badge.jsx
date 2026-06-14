import { cn } from "./utils";

const tones = {
  slate: "bg-slate-100 text-slate-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export default function Badge({ tone = "slate", pulse = false, className = "", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone] || tones.slate, pulse && "animate-pulse", className)}>
      {children}
    </span>
  );
}
