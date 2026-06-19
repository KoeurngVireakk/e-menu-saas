import { useId } from "react";
import { cn } from "./utils";

export default function Input({ label, description, error, className = "", id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const input = (
    <input
      {...props}
      id={inputId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 outline-none shadow-sm shadow-slate-900/5 transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-500",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
    />
  );

  if (!label) return input;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-bold text-slate-700">{label}</label>
      <div className="mt-2">{input}</div>
      {description ? <span id={descriptionId} className="mt-2 block text-xs font-medium leading-5 text-slate-500">{description}</span> : null}
      {error ? <span id={errorId} className="mt-2 block text-xs font-bold leading-5 text-rose-600" role="alert">{error}</span> : null}
    </div>
  );
}
