import { cn } from "./utils";

export default function Textarea({ label, error, className = "", ...props }) {
  const textarea = (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 outline-none shadow-sm shadow-slate-900/5 transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-500",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      <span className="mt-2 block">{textarea}</span>
      {error ? <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span> : null}
    </label>
  );
}
