import { cn } from "./utils";

export default function Tabs({ tabs, active, onChange, className = "" }) {
  const changeFromKeyboard = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].value);
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1", className)} role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={String(active) === String(tab.value)}
          tabIndex={String(active) === String(tab.value) ? 0 : -1}
          onClick={() => onChange(tab.value)}
          onKeyDown={(event) => changeFromKeyboard(event, index)}
          className={cn(
            "khmer-button min-h-10 shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            String(active) === String(tab.value) ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
