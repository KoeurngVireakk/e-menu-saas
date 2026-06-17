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
import useLanguage from "../i18n/useLanguage";
import { canView } from "../utils/permissions";
import AppLogo from "./common/AppLogo";
import LanguageToggle from "./common/LanguageToggle";

const groups = [
  {
    label: "Workspace",
    links: [
      { labelKey: "nav.overview", to: "/admin", feature: "dashboard", icon: Gauge },
      { labelKey: "nav.shops", to: "/admin/shops", feature: "shops", icon: Store },
      { labelKey: "common.branches", to: "/admin/branches", feature: "branches", icon: Building2 },
    ],
  },
  {
    label: "Menu",
    links: [
      { labelKey: "common.categories", to: "/admin/categories", feature: "categories", icon: BookOpen },
      { labelKey: "common.products", to: "/admin/products", feature: "products", icon: Package },
      { labelKey: "nav.translations", to: "/admin/translations", feature: "translations", icon: Languages },
      { labelKey: "nav.tableQr", to: "/admin/tables", feature: "tables", icon: Table2 },
    ],
  },
  {
    label: "Operations",
    links: [
      { labelKey: "common.orders", to: "/admin/orders", feature: "orders", icon: ClipboardList },
      { labelKey: "common.kitchen", to: "/admin/kitchen", feature: "kitchen", icon: ChefHat },
      { labelKey: "common.payments", to: "/admin/payments", feature: "payments", icon: CreditCard },
      { labelKey: "nav.invoices", to: "/admin/invoices", feature: "invoices", icon: FileText },
      { labelKey: "nav.printStations", to: "/admin/print-stations", feature: "printStations", icon: Printer },
    ],
  },
  {
    label: "Finance",
    links: [
      { labelKey: "common.reports", to: "/admin/reports", feature: "reports", icon: Activity },
      { labelKey: "nav.dailyClosing", to: "/admin/daily-closing", feature: "dailyClosing", icon: Receipt },
      { labelKey: "nav.shifts", to: "/admin/shifts", feature: "shifts", icon: WalletCards },
      { labelKey: "nav.expenses", to: "/admin/expenses", feature: "expenses", icon: BadgeDollarSign },
      { labelKey: "nav.cashLedger", to: "/admin/cash-ledger", feature: "cashLedger", icon: Globe2 },
    ],
  },
  {
    label: "System",
    links: [
      { labelKey: "nav.staff", to: "/admin/staff", feature: "staff", icon: Users },
      { labelKey: "common.settings", to: "/admin/settings", feature: "settings", icon: Settings },
      { labelKey: "nav.systemHealth", to: "/admin/system-health", feature: "systemHealth", icon: HeartPulse },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const visibleGroups = groups
    .map((group) => ({ ...group, links: group.links.filter((link) => canView(user, link.feature)) }))
    .filter((group) => group.links.length);

  return (
    <aside className="border-b border-white/70 bg-white/90 p-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/70">
      <div className="flex items-center gap-3 lg:mb-8">
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" />
        <LanguageToggle compact className="ml-auto lg:hidden" />
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:grid lg:gap-5 lg:overflow-visible lg:pb-0">
        {visibleGroups.map((group) => (
          <div key={group.label} className="contents lg:block">
            <p className="mb-2 hidden px-3 text-[11px] font-black uppercase tracking-wide text-slate-400 lg:block">{group.label}</p>
            <div className="flex gap-2 lg:grid lg:gap-1">
              {group.links.map(({ labelKey, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin"}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                        : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {t(labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-6 hidden rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:block">
        <p className="text-sm font-bold text-blue-950">MenuDIGI</p>
        <p className="mt-1 text-xs leading-5 text-blue-800">{t("common.orders")}, {t("common.payments")}, {t("common.products")}, {t("common.kitchen")}, and QR tools are available.</p>
      </div>
    </aside>
  );
}
