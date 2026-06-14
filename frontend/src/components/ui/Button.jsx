import { cn } from "./utils";

const variants = {
  primary: "bg-orange-600 text-white shadow-sm hover:bg-orange-700 focus-visible:ring-orange-500",
  dark: "bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-700",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500",
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
