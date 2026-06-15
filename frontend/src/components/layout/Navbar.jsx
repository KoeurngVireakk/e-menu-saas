import { useAuth } from "../../context/AuthContext";
import AppLogo from "../common/AppLogo";
import Button from "../ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin workspace</p>
        <h1 className="truncate text-lg font-bold text-slate-950">{user?.name || "Dashboard"}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button type="button" variant="dark" size="sm" onClick={logout}>
          Logout
        </Button>
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" className="hidden sm:inline-flex" />
        <AppLogo size="sm" iconOnly to="/admin" ariaLabel="Go to dashboard" className="sm:hidden" />
      </div>
    </header>
  );
}
