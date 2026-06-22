import { Languages } from "lucide-react";
import { languages } from "../../i18n";
import useLanguage from "../../i18n/useLanguage";

export default function LanguageToggle({ compact = false, className = "" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex max-w-full items-center rounded-xl border border-slate-200 bg-slate-100 p-1 ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      {!compact ? (
        <span className="khmer-label ml-1 mr-1 hidden items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-500 sm:inline-flex">
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
          className={`khmer-button min-h-8 min-w-12 rounded-lg px-3 text-xs font-bold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${compact ? "flex-1" : ""} ${
            language === item.code
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:bg-white/70 hover:text-slate-950"
          }`}
          onClick={() => setLanguage(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
