import AppStatusBadge from "../components/AppStatusBadge";

export default function OrderStatusBadge({ value, className = "" }) {
  return <AppStatusBadge value={value || "pending"} className={className} />;
}
