import { Languages } from "lucide-react";
import { languages } from "../../i18n";
import useLanguage from "../../i18n/useLanguage";

export default function LanguageToggle({ compact = false, className = "" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200/80 bg-white/95 p-1 shadow-sm shadow-slate-900/5 ring-1 ring-white/70 backdrop-blur ${className}`}
      aria-label={t("common.language")}
    >
      {!compact ? (
        <span className="ml-1.5 mr-1 hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500 sm:inline-flex">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          {t("common.language")}
        </span>
      ) : null}
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          aria-label={`Switch language to ${item.name}`}
          aria-pressed={language === item.code}
          className={`h-8 min-w-12 rounded-full px-3 text-xs font-black transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            language === item.code
              ? "bg-slate-950 text-white shadow-md shadow-slate-900/20"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
          }`}
          onClick={() => setLanguage(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
