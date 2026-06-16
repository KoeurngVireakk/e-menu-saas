import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";
import AppLogo from "../common/AppLogo";
import LanguageToggle from "../common/LanguageToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
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
        <LanguageToggle compact className="hidden md:inline-flex" />
        <AppButton type="button" variant="secondary" size="sm" iconLeft={<LogOut className="h-4 w-4" />} onClick={logout}>
          {t("common.logout")}
        </AppButton>
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" className="hidden sm:inline-flex" />
        <AppLogo size="sm" iconOnly to="/admin" ariaLabel="Go to dashboard" className="sm:hidden" />
      </div>
    </header>
  );
}
