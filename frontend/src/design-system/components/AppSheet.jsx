import { X } from "lucide-react";

export default function AppSheet({ open, title, children, onClose, side = "right", size = "md" }) {
  if (!open) return null;

  const position = side === "left" ? "left-0" : "right-0";
  const widths = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45">
      <aside className={`absolute top-0 ${position} flex h-full w-full ${widths[size] || widths.md} flex-col bg-white shadow-xl`} aria-label={title}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <button type="button" aria-label="Close panel" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
