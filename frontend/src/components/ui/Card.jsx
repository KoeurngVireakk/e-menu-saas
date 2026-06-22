import { cn } from "./utils";

export default function Card({ className = "", children, ...props }) {
  return (
    <section className={cn("premium-surface min-w-0 rounded-3xl border bg-white", className)} {...props}>
      {children}
    </section>
  );
}
