import { cn } from "./utils";

export default function Card({ className = "", children, ...props }) {
  return (
    <section className={cn("rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.04]", className)} {...props}>
      {children}
    </section>
  );
}
