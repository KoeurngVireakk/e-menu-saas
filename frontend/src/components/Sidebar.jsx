import { NavLink } from "react-router-dom";

const links = [
  ["Dashboard", "/admin"],
  ["Shops", "/admin/shops"],
  ["Branches", "/admin/branches"],
  ["Categories", "/admin/categories"],
  ["Products", "/admin/products"],
  ["Tables", "/admin/tables"],
  ["Orders", "/admin/orders"],
  ["Payments", "/admin/payments"],
];

export default function Sidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white p-4">
      <div className="mb-6 text-xl font-bold text-slate-950">E-Menu</div>
      <nav className="grid gap-1">
        {links.map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
