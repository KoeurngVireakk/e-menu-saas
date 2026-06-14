import { cn } from "./utils";

export default function Card({ className = "", children }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </section>
  );
}
