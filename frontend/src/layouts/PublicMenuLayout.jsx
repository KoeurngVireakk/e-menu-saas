import { Outlet, useLocation } from "react-router-dom";
import AppLogo from "../components/common/AppLogo";
import NetworkStatusBanner from "../components/pwa/NetworkStatusBanner";

export default function PublicMenuLayout() {
  const location = useLocation();
  const currentMenuPath = `${location.pathname}${location.search}`;

  return (
    <div className="min-h-screen bg-slate-100 text-left text-slate-900 [padding-bottom:env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-end">
          <AppLogo size="sm" to={currentMenuPath} ariaLabel="Go to home" className="hidden sm:inline-flex" />
          <AppLogo size="sm" iconOnly to={currentMenuPath} ariaLabel="Go to home" className="sm:hidden" />
        </div>
      </header>
      <NetworkStatusBanner />
      <main className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Outlet />
      </main>
    </div>
  );
}
