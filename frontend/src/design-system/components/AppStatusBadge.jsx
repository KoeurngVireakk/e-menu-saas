import AppBadge from "./AppBadge";

export default function AppStatusBadge({ value, className = "" }) {
  const normalized = String(value || "unknown").toLowerCase();

  return <AppBadge status={normalized} indicator className={className}>{normalized.replaceAll("_", " ")}</AppBadge>;
}
