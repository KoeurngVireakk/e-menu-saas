import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { AppButton } from "../../design-system/components";

const DISMISSED_KEY = "menudigi_install_prompt_dismissed";
const LEGACY_DISMISSED_KEY = "emenu_install_prompt_dismissed";

function isDismissed() {
  return localStorage.getItem(DISMISSED_KEY) === "1" || localStorage.getItem(LEGACY_DISMISSED_KEY) === "1";
}

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  const isStandalone = useMemo(() => (
    window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone
  ), []);

  useEffect(() => {
    if (isStandalone || isDismissed()) {
      return undefined;
    }

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [isStandalone]);

  const install = async () => {
    if (!promptEvent) {
      return;
    }

    promptEvent.prompt();
    await promptEvent.userChoice;
    setVisible(false);
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <aside className="fixed inset-x-0 bottom-4 z-50 px-4 pb-[env(safe-area-inset-bottom)]" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-md items-start justify-between gap-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-2xl shadow-slate-900/15">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">Install MenuDIGI</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Open the menu faster with an app-like experience on this device.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AppButton type="button" size="sm" onClick={install}>Install MenuDIGI</AppButton>
              <AppButton type="button" variant="ghost" size="sm" onClick={dismiss}>Maybe later</AppButton>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
