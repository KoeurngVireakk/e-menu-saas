import { useId } from "react";
import { cn } from "./utils";

export default function Select({ label, description, options = [], error, className = "", children, id, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const select = (
    <select
      {...props}
      id={selectId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 outline-none shadow-sm shadow-slate-900/5 transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-500",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
    >
      {children || options.map(([value, text]) => <option key={value || "empty"} value={value}>{text}</option>)}
    </select>
  );

  if (!label) return select;

  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-bold text-slate-700">{label}</label>
      <div className="mt-2">{select}</div>
      {description ? <span id={descriptionId} className="mt-2 block text-xs font-medium leading-5 text-slate-500">{description}</span> : null}
      {error ? <span id={errorId} className="mt-2 block text-xs font-bold leading-5 text-rose-600" role="alert">{error}</span> : null}
    </div>
  );
}
