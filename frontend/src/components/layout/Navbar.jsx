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
  ["/admin/products", "pageTitles.productsTitle", "navbar.catalogWork"],
  ["/admin/categories", "pageTitles.categoriesTitle", "navbar.catalogWork"],
  ["/admin/branches", "pageTitles.branchesTitle", "navbar.workspaceSetup"],
  ["/admin/tables", "pageTitles.tablesTitle", "navbar.workspaceSetup"],
  ["/admin/orders", "pageTitles.ordersTitle", "navbar.liveOperations"],
  ["/admin/kitchen", "pageTitles.kitchenTitle", "navbar.liveOperations"],
  ["/admin/payments", "pageTitles.paymentsTitle", "navbar.liveOperations"],
  ["/admin/settings", "pageTitles.settingsTitle", "navbar.workspaceSetup"],
  ["/admin/staff", "pageTitles.staffTitle", "navbar.workspaceSetup"],
  ["/admin/reports", "pageTitles.reportsTitle", "navbar.businessReview"],
  ["/admin/system-health", "pageTitles.systemHealthTitle", "navbar.workspaceSetup"],
  ["/admin", "pageTitles.dashboardTitle", "navbar.controlTower"],
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
          <p className="khmer-label text-xs font-bold uppercase tracking-wide text-slate-500">{t(eyebrowKey)}</p>
          <h1 className="khmer-heading truncate text-lg font-black text-slate-950">{t(titleKey)}</h1>
        </div>
      </div>
      <button
        type="button"
        className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-500 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-slate-700 focus:outline-none focus-visible:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-50 md:flex lg:max-w-sm"
        aria-label={t("navbar.searchPlaceholder")}
        onClick={onOpenCommand}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-semibold">{t("navbar.searchPlaceholder")}</span>
        <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">Ctrl K</kbd>
      </button>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <RealtimeStatusBadge status="unavailable" className="hidden xl:inline-flex" />
        <LanguageToggle compact className="hidden md:inline-flex" />
        <button
          type="button"
          aria-label={t("navbar.searchPlaceholder")}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          onClick={onOpenCommand}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label={t("navbar.notificationsPlaceholder", "Notifications are planned for a future inbox")} title={t("navbar.notificationsPlaceholder", "Notifications are planned for a future inbox")} className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:grid">
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
