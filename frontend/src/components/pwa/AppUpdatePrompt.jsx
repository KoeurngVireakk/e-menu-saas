import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { AppButton } from "../../design-system/components";

let updateServiceWorker;

export default function AppUpdatePrompt() {
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
    <aside className="fixed inset-x-0 top-4 z-50 px-4" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-2xl shadow-slate-900/15">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">A new version is ready</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Update now to get the latest MenuDIGI improvements.</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <AppButton type="button" variant="ghost" size="sm" onClick={() => setVisible(false)}>Later</AppButton>
          <AppButton type="button" size="sm" onClick={() => updateServiceWorker(true)}>Update now</AppButton>
        </div>
      </div>
    </aside>
  );
}
