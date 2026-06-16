import { getPreferredLocale, t } from "../utils/localization";

export default function OfflineBanner({ cached = false, locale = getPreferredLocale() }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-sm" role="status" aria-live="polite">
        {cached
          ? t(locale, "offlineCached")
          : t(locale, "offlineRefresh")}
      </div>
    </div>
  );
}
