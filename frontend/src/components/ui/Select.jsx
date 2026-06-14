import { cn } from "./utils";

export default function Select({ label, options = [], error, className = "", children, ...props }) {
  const select = (
    <select
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100",
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
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="mt-1 block">{select}</span>
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
