import { useEffect, useState } from "react";
import Button from "./ui/Button";

const DISMISSED_KEY = "emenu_install_prompt_dismissed";

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "1") {
      return undefined;
    }

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

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
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
        <div>
          <p className="text-sm font-bold text-slate-950">Install E-Menu</p>
          <p className="text-xs text-slate-500">Open faster and use the menu app-style.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>Later</Button>
          <Button type="button" size="sm" onClick={install}>Install</Button>
        </div>
      </div>
    </div>
  );
}
