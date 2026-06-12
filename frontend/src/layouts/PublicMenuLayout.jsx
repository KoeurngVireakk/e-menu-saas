import { Outlet } from "react-router-dom";

export default function PublicMenuLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-left text-slate-900">
      <Outlet />
    </div>
  );
}
