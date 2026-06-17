import { Bell, LogOut, UserCircle } from "lucide-react";
import RealtimeStatusBadge from "../realtime/RealtimeStatusBadge";
import { confirmAction } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";
import AppLogo from "../common/AppLogo";
import LanguageToggle from "../common/LanguageToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const confirmLogout = async () => {
    if (await confirmAction("Log out?", "You will return to the sign in page.")) {
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
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("common.adminWorkspace")}</p>
          <h1 className="truncate text-lg font-black text-slate-950">{user?.name || t("common.dashboard")}</h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <RealtimeStatusBadge status="unavailable" className="hidden xl:inline-flex" />
        <LanguageToggle compact className="hidden md:inline-flex" />
        <button type="button" aria-label="Notifications" className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:grid">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <AppButton type="button" variant="secondary" size="sm" iconLeft={<LogOut className="h-4 w-4" />} onClick={confirmLogout}>
          {t("common.logout")}
        </AppButton>
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" className="hidden sm:inline-flex" />
        <AppLogo size="sm" iconOnly to="/admin" ariaLabel="Go to dashboard" className="sm:hidden" />
      </div>
    </header>
  );
}
