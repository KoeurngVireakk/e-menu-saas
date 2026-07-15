import { cn } from "../../components/ui/utils";

const toneStyles = {
  success: "border-[var(--menudigi-success-border)] bg-[var(--menudigi-success-soft)] text-[var(--menudigi-success)]",
  warning: "border-[var(--menudigi-warning-border)] bg-[var(--menudigi-warning-soft)] text-[var(--menudigi-warning)]",
  danger: "border-[var(--menudigi-danger-border)] bg-[var(--menudigi-danger-soft)] text-[var(--menudigi-danger)]",
  information: "border-[var(--menudigi-info-border)] bg-[var(--menudigi-info-soft)] text-[var(--menudigi-info)]",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
};

const statusTones = {
  active: "success", available: "success", completed: "success", paid: "success", ready: "success", success: "success",
  pending: "warning", preparing: "warning", attention: "warning", warning: "warning",
  cancelled: "danger", danger: "danger", failed: "danger", overdue: "danger", rejected: "danger", suspended: "danger",
  accepted: "information", info: "information", information: "information", new: "information", processing: "information", selected: "information",
  disabled: "neutral", inactive: "neutral", neutral: "neutral", unknown: "neutral", unpaid: "neutral",
};

export default function AppBadge({ children, status = "information", tone, indicator = false, pulse = false, className = "" }) {
  const semanticTone = tone || statusTones[String(status).toLowerCase()] || "neutral";

  return (
    <span className={cn("khmer-text inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black leading-5", toneStyles[semanticTone], className)}>
      {indicator ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full bg-current", pulse && "animate-pulse motion-reduce:animate-none")} aria-hidden="true" /> : null}
      {children || String(status).replaceAll("_", " ")}
    </span>
  );
}
