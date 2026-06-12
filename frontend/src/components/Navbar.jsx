import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm text-slate-500">Admin</p>
        <h1 className="text-lg font-semibold text-slate-950">{user?.name || "Dashboard"}</h1>
      </div>
      <button onClick={logout} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        Logout
      </button>
    </header>
  );
}
