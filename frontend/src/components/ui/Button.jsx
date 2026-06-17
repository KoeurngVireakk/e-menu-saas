import { cn } from "./utils";

const variants = {
  primary: "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:ring-blue-500",
  dark: "bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-slate-700",
  secondary: "border border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-900/5 hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:-translate-y-0.5 hover:bg-rose-700 focus-visible:ring-rose-500",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-9 w-9",
};

export default function Button({ as: Component = "button", variant = "primary", size = "md", className = "", children, ...props }) {
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55",
        "rounded-2xl duration-200 disabled:translate-y-0",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
