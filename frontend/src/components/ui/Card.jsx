import { cn } from "./utils";

export default function Card({ className = "", children }) {
  return (
    <section className={cn("rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 ring-1 ring-white/70", className)}>
      {children}
    </section>
  );
}
