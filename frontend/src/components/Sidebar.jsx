import { NavLink } from "react-router-dom";
import {
  Activity,
  BadgeDollarSign,
  BookOpen,
  Building2,
  ChefHat,
  ClipboardList,
  Compass,
  CreditCard,
  FileText,
  Gauge,
  Globe2,
  HeartPulse,
  MessageSquareText,
  Languages,
  Package,
  Printer,
  Receipt,
  Settings,
  Store,
  Table2,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useLanguage from "../i18n/useLanguage";
import { canView } from "../utils/permissions";
import AppLogo from "./common/AppLogo";
import LanguageToggle from "./common/LanguageToggle";

const groups = [
  {
    labelKey: "nav.groupOverview",
    links: [
      { labelKey: "nav.overview", to: "/admin", feature: "dashboard", icon: Gauge },
      { labelKey: "nav.onboarding", to: "/admin/onboarding", feature: "dashboard", icon: Compass, ownerOnly: true, hideInDemo: true },
      { labelKey: "nav.shops", to: "/admin/shops", feature: "shops", icon: Store },
      { labelKey: "common.branches", to: "/admin/branches", feature: "branches", icon: Building2 },
    ],
  },
  {
    labelKey: "nav.groupOperations",
    links: [
      { labelKey: "common.orders", to: "/admin/orders", feature: "orders", icon: ClipboardList },
      { labelKey: "common.kitchen", to: "/admin/kitchen", feature: "kitchen", icon: ChefHat },
      { labelKey: "common.payments", to: "/admin/payments", feature: "payments", icon: CreditCard },
      { labelKey: "common.reviews", to: "/admin/reviews", feature: "reviews", icon: MessageSquareText },
      { labelKey: "nav.invoices", to: "/admin/invoices", feature: "invoices", icon: FileText },
      { labelKey: "nav.printStations", to: "/admin/print-stations", feature: "printStations", icon: Printer },
    ],
  },
  {
    labelKey: "nav.groupCatalog",
    links: [
      { labelKey: "common.categories", to: "/admin/categories", feature: "categories", icon: BookOpen },
      { labelKey: "common.products", to: "/admin/products", feature: "products", icon: Package },
      { labelKey: "nav.translations", to: "/admin/translations", feature: "translations", icon: Languages },
      { labelKey: "nav.tableQr", to: "/admin/tables", feature: "tables", icon: Table2 },
    ],
  },
  {
    labelKey: "nav.groupBusiness",
    links: [
      { labelKey: "common.reports", to: "/admin/reports", feature: "reports", icon: Activity },
      { labelKey: "nav.dailyClosing", to: "/admin/daily-closing", feature: "dailyClosing", icon: Receipt },
      { labelKey: "nav.shifts", to: "/admin/shifts", feature: "shifts", icon: WalletCards },
      { labelKey: "nav.expenses", to: "/admin/expenses", feature: "expenses", icon: BadgeDollarSign },
      { labelKey: "nav.cashLedger", to: "/admin/cash-ledger", feature: "cashLedger", icon: Globe2 },
    ],
  },
  {
    labelKey: "nav.groupSettings",
    links: [
      { labelKey: "nav.staff", to: "/admin/staff", feature: "staff", icon: Users },
      { labelKey: "common.settings", to: "/admin/settings", feature: "settings", icon: Settings },
      { labelKey: "nav.systemHealth", to: "/admin/system-health", feature: "systemHealth", icon: HeartPulse },
    ],
  },
];

export default function Sidebar({ mobileOpen = true, onClose }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isDemo = user?.shops?.some((shop) => shop.is_demo);
  const visibleGroups = groups
    .map((group) => ({ ...group, links: group.links.filter((link) => canView(user, link.feature) && (!link.ownerOnly || ["shop_owner", "super_admin"].includes(user?.role)) && (!link.hideInDemo || !isDemo)) }))
    .filter((group) => group.links.length);

  return (
    <>
    {mobileOpen && onClose ? <button type="button" aria-label={t("navbar.closeNavigation")} className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden" onClick={onClose} /> : null}
    <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex h-dvh w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-r border-slate-200/80 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl shadow-slate-950/15 backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-dvh lg:w-auto lg:max-w-none lg:translate-x-0 lg:flex-col lg:overflow-hidden lg:p-4 lg:shadow-sm`}>
      <div className="premium-surface flex shrink-0 items-center gap-3 rounded-3xl border bg-white p-2 lg:mb-7">
        <AppLogo size="md" to="/admin" ariaLabel="Go to dashboard" />
        <LanguageToggle compact className="ml-auto lg:hidden" />
        {mobileOpen && onClose ? <button type="button" aria-label={t("navbar.closeNavigation")} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden" onClick={onClose}><X className="h-5 w-5" aria-hidden="true" /></button> : null}
      </div>
      <nav id="admin-navigation" className="mt-4 grid min-h-0 flex-1 content-start gap-5 overflow-x-hidden overflow-y-auto pr-1 pb-1 lg:mt-0 lg:min-h-0 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0" aria-label={t("navbar.adminNavigation")}>
        {visibleGroups.map((group) => (
          <div key={group.labelKey}>
            <p className="khmer-label mb-2 px-3 text-[11px] font-black text-slate-400">{t(group.labelKey)}</p>
            <div className="grid gap-1">
              {group.links.map(({ labelKey, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `khmer-button inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-900/5"
                        : "border border-transparent text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-blue-700"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {t(labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="premium-surface mt-6 hidden shrink-0 rounded-3xl border bg-white p-4 lg:block">
        <p className="khmer-label text-xs font-black text-blue-600">{t("common.adminWorkspace")}</p>
        <p className="mt-1 text-sm font-black text-blue-950">MenuDIGI</p>
        <p className="khmer-text mt-1 text-xs leading-5 text-blue-800">{t("nav.workspaceHint")}</p>
      </div>
    </aside>
    </>
  );
}
