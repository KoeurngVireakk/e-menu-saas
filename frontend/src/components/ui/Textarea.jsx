import { cn } from "./utils";

export default function Textarea({ label, error, className = "", ...props }) {
  const textarea = (
    <textarea
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="mt-1 block">{textarea}</span>
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
