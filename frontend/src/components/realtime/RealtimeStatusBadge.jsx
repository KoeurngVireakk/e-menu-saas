const tones = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  connecting: "border-amber-200 bg-amber-50 text-amber-700",
  initialized: "border-amber-200 bg-amber-50 text-amber-700",
  disconnected: "border-slate-200 bg-slate-50 text-slate-600",
  unavailable: "border-slate-200 bg-slate-50 text-slate-600",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const labels = {
  connected: "Live",
  connecting: "Connecting",
  initialized: "Connecting",
  disconnected: "Offline",
  unavailable: "Realtime off",
  error: "Realtime error",
};

export default function RealtimeStatusBadge({ status = "disconnected", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[status] || tones.disconnected} ${className}`}>
      {labels[status] || labels.disconnected}
    </span>
  );
}
