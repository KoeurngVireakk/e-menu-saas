import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-left text-slate-900">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_1fr]">
        <Sidebar />
        <div className="min-w-0">
          <Navbar />
          <main className="mx-auto max-w-7xl p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
