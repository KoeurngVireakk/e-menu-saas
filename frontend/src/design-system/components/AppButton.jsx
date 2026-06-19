import { Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";

const variants = {
  primary: "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 focus-visible:ring-blue-500",
  secondary: "border border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-900/5 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 focus-visible:ring-slate-300",
  ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 focus-visible:ring-rose-500",
  success: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 focus-visible:ring-emerald-500",
  outline: "border border-blue-200 bg-white text-blue-700 shadow-sm shadow-blue-900/5 hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0 focus-visible:ring-blue-500",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export default function AppButton({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "khmer-button inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55",
        "min-w-0 whitespace-nowrap motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? "w-full" : "",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : iconLeft}
      <span>{children}</span>
      {!loading ? iconRight : null}
    </Component>
  );
}
