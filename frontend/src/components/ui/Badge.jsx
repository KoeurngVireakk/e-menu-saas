import AppBadge from "../../design-system/components/AppBadge";

const toneAliases = {
  slate: "neutral",
  orange: "warning",
  green: "success",
  blue: "information",
  red: "danger",
  amber: "warning",
  indigo: "information",
};

export default function Badge({ tone = "slate", pulse = false, className = "", children }) {
  return <AppBadge tone={toneAliases[tone] || tone} pulse={pulse} indicator={pulse} className={className}>{children}</AppBadge>;
}
