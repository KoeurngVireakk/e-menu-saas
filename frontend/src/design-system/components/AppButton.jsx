import { Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";

const variants = {
  primary: "bg-[var(--menudigi-primary)] text-white shadow-sm shadow-blue-600/20 hover:bg-[var(--menudigi-primary-hover)] hover:shadow-blue-600/25 active:scale-[0.98] focus-visible:ring-[var(--menudigi-focus-ring)]",
  secondary: "border border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-900/5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-slate-900/10 active:scale-[0.98] focus-visible:ring-slate-300",
  outline: "border border-blue-200 bg-white text-blue-700 shadow-sm shadow-blue-900/5 hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] focus-visible:ring-[var(--menudigi-focus-ring)]",
  ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 hover:shadow-rose-600/25 active:scale-[0.98] focus-visible:ring-rose-500",
  link: "min-h-0 px-0 text-blue-700 underline-offset-4 hover:text-blue-800 hover:underline focus-visible:ring-[var(--menudigi-focus-ring)]",
  success: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/25 active:scale-[0.98] focus-visible:ring-emerald-500",
  dark: "bg-slate-950 text-white shadow-sm shadow-slate-950/15 hover:bg-slate-800 active:scale-[0.98] focus-visible:ring-slate-700",
};

const sizes = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
  icon: "min-h-11 min-w-11 p-2.5",
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
  onClick,
  ...props
}) {
  const isNativeButton = Component === "button";
  const unavailable = disabled || loading;
  const buttonProps = isNativeButton
    ? { disabled: unavailable, ...(!props.type ? { type: "button" } : {}) }
    : { "aria-disabled": unavailable || undefined, tabIndex: unavailable ? -1 : props.tabIndex };
  const accessibleLabel = props["aria-label"] || (loading && typeof children === "string" ? `${children} — loading` : undefined);
  const handleClick = (event) => {
    if (!isNativeButton && unavailable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      className={cn(
        "khmer-button relative inline-flex min-w-0 items-center justify-center rounded-2xl text-center font-bold leading-snug transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:scale-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100 disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none",
        variants[variant] || variants.primary,
        variant === "link" ? "" : (sizes[size] || sizes.md),
        fullWidth ? "w-full" : "",
        className,
      )}
      {...props}
      {...buttonProps}
      aria-busy={loading || undefined}
      aria-label={accessibleLabel}
      onClick={handleClick}
    >
      <span className={`inline-flex min-w-0 items-center justify-center gap-2 ${loading ? "invisible" : ""}`}>
        {iconLeft}
        {children != null ? <span className="min-w-0">{children}</span> : null}
        {iconRight}
      </span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center" role="status" aria-label="Loading">
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </span>
      ) : null}
    </Component>
  );
}
