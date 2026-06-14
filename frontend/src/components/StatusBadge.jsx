import Badge from "./ui/Badge";

const tone = {
  active: "green",
  paid: "green",
  ready: "green",
  completed: "green",
  pending: "amber",
  preparing: "blue",
  accepted: "indigo",
  inactive: "slate",
  unpaid: "slate",
  failed: "red",
  cancelled: "red",
  rejected: "red",
  suspended: "red",
};

const liveStates = new Set(["pending", "preparing", "accepted", "active"]);

export default function StatusBadge({ value }) {
  const normalized = value || "unknown";

  return (
    <Badge tone={tone[normalized] || "slate"} pulse={liveStates.has(normalized)}>
      {normalized}
    </Badge>
  );
}
