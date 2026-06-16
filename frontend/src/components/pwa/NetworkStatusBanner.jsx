import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import useOnlineStatus from "../../hooks/useOnlineStatus";

export default function NetworkStatusBanner({ className = "" }) {
  const online = useOnlineStatus();
  const wasOnline = useRef(online);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (!wasOnline.current && online) {
      setShowBackOnline(true);
      const timeout = window.setTimeout(() => setShowBackOnline(false), 3000);
      wasOnline.current = online;

      return () => window.clearTimeout(timeout);
    }

    wasOnline.current = online;
    return undefined;
  }, [online]);

  if (online && !showBackOnline) {
    return null;
  }

  const isOffline = !online;

  return (
    <div className={`px-4 pt-3 ${className}`} role="status" aria-live="polite">
      <div className={`mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
        isOffline
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      >
        {isOffline ? <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>
          {isOffline
            ? "You're offline. Menu browsing may still work, but ordering needs internet."
            : "Back online."}
        </span>
      </div>
    </div>
  );
}
