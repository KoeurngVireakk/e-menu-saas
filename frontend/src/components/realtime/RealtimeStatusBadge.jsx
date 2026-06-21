import { useContext } from "react";
import { LanguageContext } from "../../i18n/languageContext";

const tones = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  connecting: "border-amber-200 bg-amber-50 text-amber-700",
  initialized: "border-amber-200 bg-amber-50 text-amber-700",
  disconnected: "border-slate-200 bg-slate-50 text-slate-600",
  unavailable: "border-slate-200 bg-slate-50 text-slate-600",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const labelKeys = {
  connected: "realtime.connected",
  connecting: "realtime.connecting",
  initialized: "realtime.connecting",
  disconnected: "realtime.disconnected",
  unavailable: "realtime.disconnected",
  error: "realtime.error",
};

const fallbackLabels = {
  connected: "Live updates on",
  connecting: "Reconnecting live updates...",
  initialized: "Connecting live updates...",
  disconnected: "Live updates paused",
  unavailable: "Live updates paused",
  error: "Realtime connection issue",
};

const fallbackTooltips = {
  connected: "Live operational updates are connected.",
  connecting: "Trying to reconnect live operational updates.",
  initialized: "Preparing live operational updates.",
  disconnected: "Live updates are paused. Refresh or reconnect if orders stop changing.",
  unavailable: "Live updates are not active in this view.",
  error: "Realtime has an issue. Manual refresh still works.",
};

export default function RealtimeStatusBadge({ status = "disconnected", compact = false, className = "" }) {
  const languageContext = useContext(LanguageContext);
  const label = languageContext?.t?.(labelKeys[status] || labelKeys.disconnected, fallbackLabels[status] || fallbackLabels.disconnected)
    || fallbackLabels[status]
    || fallbackLabels.disconnected;
  const tooltip = languageContext?.t?.(`realtime.tooltips.${status}`, fallbackTooltips[status] || fallbackTooltips.disconnected)
    || fallbackTooltips[status]
    || "Shows whether live operational updates are currently connected.";

  return (
    <span
      className={`inline-flex items-center rounded-full border text-xs font-black ${compact ? "h-8 gap-0 px-2" : "gap-1.5 px-3 py-1.5 shadow-sm shadow-slate-900/5"} ${tones[status] || tones.disconnected} ${className}`}
      aria-live="polite"
      role="status"
      title={tooltip}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "connecting" || status === "initialized" ? "animate-pulse bg-amber-500" : status === "error" ? "bg-rose-500" : "bg-current opacity-60"}`}
        aria-hidden="true"
      />
      <span className={compact ? "sr-only" : ""}>{label}</span>
    </span>
  );
}
