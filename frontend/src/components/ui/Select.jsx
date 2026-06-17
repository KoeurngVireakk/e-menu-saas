import { cn } from "./utils";

export default function Select({ label, options = [], error, className = "", children, ...props }) {
  const select = (
    <select
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 outline-none shadow-sm shadow-slate-900/5 transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-500",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
      {...props}
    >
      {children || options.map(([value, text]) => <option key={value || "empty"} value={value}>{text}</option>)}
    </select>
  );

  if (!label) return select;

  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      <span className="mt-2 block">{select}</span>
      {error ? <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span> : null}
    </label>
  );
}
