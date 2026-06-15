import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "../../design-system/components";
import AppLogo from "../common/AppLogo";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin workspace</p>
          <h1 className="truncate text-lg font-black text-slate-950">{user?.name || "Dashboard"}</h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" iconLeft={<LogOut className="h-4 w-4" />} onClick={logout}>
          Logout
        </AppButton>
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" className="hidden sm:inline-flex" />
        <AppLogo size="sm" iconOnly to="/admin" ariaLabel="Go to dashboard" className="sm:hidden" />
      </div>
    </header>
  );
}
