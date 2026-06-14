import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import Button from "./ui/Button";

let updateServiceWorker;

export default function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!updateServiceWorker) {
      updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          setVisible(true);
        },
      });
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
        <div>
          <p className="text-sm font-bold text-slate-950">New version available</p>
          <p className="text-xs text-slate-500">Refresh to use the latest E-Menu app.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setVisible(false)}>Later</Button>
          <Button type="button" size="sm" onClick={() => updateServiceWorker(true)}>Refresh</Button>
        </div>
      </div>
    </div>
  );
}
