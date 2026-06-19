import { Bell, LogOut, Search, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import RealtimeStatusBadge from "../realtime/RealtimeStatusBadge";
import { confirmAction } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";
import AppLogo from "../common/AppLogo";
import LanguageToggle from "../common/LanguageToggle";

const pageContext = [
  ["/admin/products", "common.products", "navbar.catalogWork"],
  ["/admin/categories", "common.categories", "navbar.catalogWork"],
  ["/admin/branches", "common.branches", "navbar.workspaceSetup"],
  ["/admin/tables", "common.tables", "navbar.workspaceSetup"],
  ["/admin/orders", "common.orders", "navbar.liveOperations"],
  ["/admin/kitchen", "common.kitchen", "navbar.liveOperations"],
  ["/admin/payments", "common.payments", "navbar.liveOperations"],
  ["/admin/settings", "common.settings", "navbar.workspaceSetup"],
  ["/admin/staff", "nav.staff", "navbar.workspaceSetup"],
  ["/admin/reports", "common.reports", "navbar.businessReview"],
  ["/admin", "common.dashboard", "navbar.controlTower"],
];

function getPageContext(pathname) {
  return pageContext.find(([path]) => pathname === path || (path !== "/admin" && pathname.startsWith(path))) || pageContext.at(-1);
}

export default function Navbar({ onOpenCommand }) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [, titleKey, eyebrowKey] = getPageContext(pathname);

  const confirmLogout = async () => {
    if (await confirmAction(t("auth.logoutTitle"), t("auth.logoutDescription"))) {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t(eyebrowKey)}</p>
          <h1 className="truncate text-lg font-black text-slate-950">{t(titleKey)}</h1>
        </div>
      </div>
      <label className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm shadow-slate-900/5 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 lg:flex lg:max-w-sm">
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="sr-only">{t("common.search")}</span>
        <input
          type="search"
          readOnly
          className="w-full bg-transparent font-semibold outline-none placeholder:text-slate-400"
          placeholder={t("navbar.searchPlaceholder")}
          aria-label={t("navbar.searchPlaceholder")}
          onClick={onOpenCommand}
          onFocus={onOpenCommand}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenCommand?.();
            }
          }}
        />
        <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">Ctrl K</kbd>
      </label>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <RealtimeStatusBadge status="unavailable" className="hidden xl:inline-flex" />
        <LanguageToggle compact className="hidden md:inline-flex" />
        <button type="button" aria-label="Notifications" className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:grid">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <AppButton type="button" variant="secondary" size="sm" iconLeft={<LogOut className="h-4 w-4" />} onClick={confirmLogout}>
          {t("common.logout")}
        </AppButton>
        <AppLogo size="md" to="/admin" ariaLabel={t("navbar.goDashboard")} className="hidden sm:inline-flex" />
        <AppLogo size="sm" iconOnly to="/admin" ariaLabel={t("navbar.goDashboard")} className="sm:hidden" />
      </div>
    </header>
  );
}
