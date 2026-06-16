import { Languages } from "lucide-react";
import { languages } from "../../i18n";
import useLanguage from "../../i18n/useLanguage";

export default function LanguageToggle({ compact = false, className = "" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm ${className}`}
      aria-label={t("common.language")}
    >
      {!compact ? <Languages className="ml-2 h-4 w-4 text-slate-500" aria-hidden="true" /> : null}
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          aria-label={`Switch language to ${item.name}`}
          aria-pressed={language === item.code}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            language === item.code ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          }`}
          onClick={() => setLanguage(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
