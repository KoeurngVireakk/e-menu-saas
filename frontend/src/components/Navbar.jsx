import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin workspace</p>
        <h1 className="text-lg font-bold text-slate-950">{user?.name || "Dashboard"}</h1>
      </div>
      <Button type="button" variant="dark" size="sm" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
