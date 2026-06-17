let echoInstance = null;
let echoInitPromise = null;

export function isRealtimeConfigured() {
  return Boolean(import.meta.env.VITE_REVERB_APP_KEY);
}

export async function getEcho() {
  if (typeof window === "undefined") return null;
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY;
  if (!key) return null;

  if (echoInitPromise) return echoInitPromise;

  echoInitPromise = Promise.all([
    import("laravel-echo"),
    import("pusher-js"),
  ])
    .then(([echoModule, pusherModule]) => {
      window.Pusher = pusherModule.default;

      const Echo = echoModule.default;
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
      const token = localStorage.getItem("emenu_token");
      const scheme = import.meta.env.VITE_REVERB_SCHEME || "http";
      const port = Number(import.meta.env.VITE_REVERB_PORT || (scheme === "https" ? 443 : 8080));

      echoInstance = new Echo({
        broadcaster: "reverb",
        key,
        wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        wsPort: port,
        wssPort: port,
        forceTLS: scheme === "https",
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${apiBaseUrl.replace(/\/$/, "")}/broadcasting/auth`,
        auth: {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      });

      return echoInstance;
    })
    .finally(() => {
      echoInitPromise = null;
    });

  return echoInitPromise;
}

export function getExistingEcho() {
  return echoInstance;
}

export function disconnectEcho() {
  if (!echoInstance) return;

  echoInstance.disconnect();
  echoInstance = null;
}
