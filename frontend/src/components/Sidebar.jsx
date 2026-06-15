import { NavLink } from "react-router-dom";
import {
  Activity,
  BadgeDollarSign,
  BookOpen,
  Building2,
  ChefHat,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  Globe2,
  HeartPulse,
  Languages,
  Package,
  Printer,
  Receipt,
  Settings,
  Store,
  Table2,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { canView } from "../utils/permissions";
import AppLogo from "./common/AppLogo";

const links = [
  { label: "Overview", to: "/admin", feature: "dashboard", icon: Gauge },
  { label: "Shops", to: "/admin/shops", feature: "shops", icon: Store },
  { label: "Branches", to: "/admin/branches", feature: "branches", icon: Building2 },
  { label: "Categories", to: "/admin/categories", feature: "categories", icon: BookOpen },
  { label: "Products", to: "/admin/products", feature: "products", icon: Package },
  { label: "Translations", to: "/admin/translations", feature: "translations", icon: Languages },
  { label: "Table QR", to: "/admin/tables", feature: "tables", icon: Table2 },
  { label: "Orders", to: "/admin/orders", feature: "orders", icon: ClipboardList },
  { label: "Kitchen", to: "/admin/kitchen", feature: "kitchen", icon: ChefHat },
  { label: "Payments", to: "/admin/payments", feature: "payments", icon: CreditCard },
  { label: "Invoices", to: "/admin/invoices", feature: "invoices", icon: FileText },
  { label: "Reports", to: "/admin/reports", feature: "reports", icon: Activity },
  { label: "Daily Closing", to: "/admin/daily-closing", feature: "dailyClosing", icon: Receipt },
  { label: "Shifts", to: "/admin/shifts", feature: "shifts", icon: WalletCards },
  { label: "Expenses", to: "/admin/expenses", feature: "expenses", icon: BadgeDollarSign },
  { label: "Cash Ledger", to: "/admin/cash-ledger", feature: "cashLedger", icon: Globe2 },
  { label: "Print Stations", to: "/admin/print-stations", feature: "printStations", icon: Printer },
  { label: "Staff", to: "/admin/staff", feature: "staff", icon: Users },
  { label: "Settings", to: "/admin/settings", feature: "settings", icon: Settings },
  { label: "System Health", to: "/admin/system-health", feature: "systemHealth", icon: HeartPulse },
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleLinks = links.filter((link) => canView(user, link.feature));

  return (
    <aside className="border-b border-slate-200 bg-white/95 p-4 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 lg:mb-8">
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" />
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
        {visibleLinks.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 hidden rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:block">
        <p className="text-sm font-bold text-blue-950">Service status</p>
        <p className="mt-1 text-xs leading-5 text-blue-800">Orders, payments, products, kitchen, and table QR tools are available.</p>
      </div>
    </aside>
  );
}
