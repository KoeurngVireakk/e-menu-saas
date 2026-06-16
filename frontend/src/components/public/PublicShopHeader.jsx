import { Search } from "lucide-react";
import { AppBadge } from "../../design-system/components";
import { supportedLocales, t } from "../../utils/localization";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function PublicShopHeader({ menu, locale, query, onQuery, onClearQuery, onLocale }) {
  const coverUrl = menu.shop.cover_path ? `${storageUrl}/${menu.shop.cover_path}` : null;
  const logoUrl = menu.shop.logo_path ? `${storageUrl}/${menu.shop.logo_path}` : null;

  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-slate-950 text-white shadow-sm" style={{ backgroundColor: menu.shop.primary_color || "#0f172a" }}>
      {coverUrl ? <img className="absolute inset-0 h-full w-full object-cover opacity-35" src={coverUrl} alt={`${menu.shop.name} cover`} /> : null}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/20 to-slate-950/80" />
      <div className="relative px-4 pb-6 pt-8 sm:px-6">
        <div className="mb-5 flex justify-end gap-2">
          {supportedLocales.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onLocale(item.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                locale === item.code ? "bg-white text-slate-950" : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 text-xl font-black backdrop-blur">
            {logoUrl ? <img className="h-full w-full object-cover" src={logoUrl} alt={`${menu.shop.name} logo`} /> : menu.shop.name?.slice(0, 2)}
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap gap-2">
              <AppBadge status="info">{menu.branch?.name || t(locale, "mainBranch")}</AppBadge>
              {menu.table ? <AppBadge status="success">{menu.table.table_name}</AppBadge> : null}
              <AppBadge status={menu.shop.status === "inactive" ? "danger" : "success"}>{menu.shop.status || "active"}</AppBadge>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{menu.shop.name}</h1>
            <p className="mt-1 text-sm leading-relaxed text-white/80">{menu.shop.description || t(locale, "freshMenu")}</p>
          </div>
        </div>

        <label className="relative mt-5 block">
          <span className="sr-only">{t(locale, "searchMenu")}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            aria-label={t(locale, "searchMenu")}
            className="h-12 w-full rounded-2xl border border-white/20 bg-white pl-12 pr-20 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300"
            placeholder={t(locale, "searchMenu")}
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          {query ? (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50" onClick={onClearQuery}>
              Clear
            </button>
          ) : null}
        </label>
      </div>
    </section>
  );
}
