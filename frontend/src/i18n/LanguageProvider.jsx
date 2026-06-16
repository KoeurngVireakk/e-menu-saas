import { useEffect, useMemo, useState } from "react";
import { setPreferredLocale } from "../utils/localization";
import { LanguageContext } from "./languageContext";
import { translations } from "./translations";

export const LANGUAGE_STORAGE_KEY = "menudigi_language";

function normalizeLanguage(language) {
  return language === "km" ? "km" : "en";
}

function getValue(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en"));

  const setLanguage = (nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    setPreferredLocale(normalized);
    setLanguageState(normalized);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    setPreferredLocale(language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    isKhmer: language === "km",
    setLanguage,
    toggleLanguage: () => setLanguage(language === "km" ? "en" : "km"),
    t: (key, fallback = key) => getValue(translations[language], key) ?? getValue(translations.en, key) ?? fallback,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
