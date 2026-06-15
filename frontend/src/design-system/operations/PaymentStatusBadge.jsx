import AppStatusBadge from "../components/AppStatusBadge";

export default function PaymentStatusBadge({ value, className = "" }) {
  const normalized = value === "confirmed" ? "paid" : value || "unpaid";

  return <AppStatusBadge value={normalized} className={className} />;
}
