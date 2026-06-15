import AppBadge from "./AppBadge";

export default function AppStatusBadge({ value, className = "" }) {
  const normalized = String(value || "info").toLowerCase();

  return <AppBadge status={normalized} className={className}>{normalized.replaceAll("_", " ")}</AppBadge>;
}
