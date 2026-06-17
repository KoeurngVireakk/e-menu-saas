const tones = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  connecting: "border-amber-200 bg-amber-50 text-amber-700",
  initialized: "border-amber-200 bg-amber-50 text-amber-700",
  disconnected: "border-slate-200 bg-slate-50 text-slate-600",
  unavailable: "border-slate-200 bg-slate-50 text-slate-600",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const labels = {
  connected: "Live updates on",
  connecting: "Connecting live updates...",
  initialized: "Connecting live updates...",
  disconnected: "Live updates paused",
  unavailable: "Live updates paused",
  error: "Realtime connection issue",
};

export default function RealtimeStatusBadge({ status = "disconnected", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black shadow-sm shadow-slate-900/5 ${tones[status] || tones.disconnected} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "error" ? "bg-rose-500" : "bg-current opacity-60"}`} aria-hidden="true" />
      {labels[status] || labels.disconnected}
    </span>
  );
}
