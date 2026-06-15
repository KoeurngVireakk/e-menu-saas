import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canView } from "../utils/permissions";

const links = [
  { label: "Overview", to: "/admin", feature: "dashboard" },
  { label: "Shops", to: "/admin/shops", feature: "shops" },
  { label: "Branches", to: "/admin/branches", feature: "branches" },
  { label: "Categories", to: "/admin/categories", feature: "categories" },
  { label: "Products", to: "/admin/products", feature: "products" },
  { label: "Translations", to: "/admin/translations", feature: "translations" },
  { label: "Table QR", to: "/admin/tables", feature: "tables" },
  { label: "Orders", to: "/admin/orders", feature: "orders" },
  { label: "Payments", to: "/admin/payments", feature: "payments" },
  { label: "Invoices", to: "/admin/invoices", feature: "invoices" },
  { label: "Staff", to: "/admin/staff", feature: "staff" },
  { label: "Settings", to: "/admin/settings", feature: "settings" },
  { label: "System Health", to: "/admin/system-health", feature: "systemHealth" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleLinks = links.filter((link) => canView(user, link.feature));

  return (
    <aside className="border-b border-slate-200 bg-white/95 p-4 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 lg:mb-8">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">EM</div>
        <div>
          <div className="text-lg font-black tracking-tight text-slate-950">E-Menu</div>
          <p className="text-xs font-medium text-slate-500">Restaurant control</p>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
        {visibleLinks.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 hidden rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:block">
        <p className="text-sm font-bold text-orange-900">Service status</p>
        <p className="mt-1 text-xs leading-5 text-orange-800">Orders, payments, products, and table QR tools are available.</p>
      </div>
    </aside>
  );
}
