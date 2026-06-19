import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Building2,
  BarChart3,
  ChefHat,
  ClipboardList,
  CreditCard,
  Gauge,
  Package,
  Plus,
  QrCode,
  Search,
  Settings,
} from "lucide-react";
import useLanguage from "../../i18n/useLanguage";

const actions = [
  { key: "dashboard", groupKey: "command.groupOverview", labelKey: "command.dashboard", hintKey: "command.dashboardHint", to: "/admin", icon: Gauge },
  { key: "orders", groupKey: "command.groupOperations", labelKey: "command.orders", hintKey: "command.ordersHint", to: "/admin/orders", icon: ClipboardList },
  { key: "kitchen", groupKey: "command.groupOperations", labelKey: "command.kitchen", hintKey: "command.kitchenHint", to: "/admin/kitchen", icon: ChefHat },
  { key: "payments", groupKey: "command.groupOperations", labelKey: "command.payments", hintKey: "command.paymentsHint", to: "/admin/payments", icon: CreditCard },
  { key: "reports", groupKey: "command.groupBusiness", labelKey: "command.reports", hintKey: "command.reportsHint", to: "/admin/reports", icon: BarChart3 },
  { key: "products", groupKey: "command.groupCatalog", labelKey: "command.products", hintKey: "command.productsHint", to: "/admin/products", icon: Package },
  { key: "categories", groupKey: "command.groupCatalog", labelKey: "command.categories", hintKey: "command.categoriesHint", to: "/admin/categories", icon: BookOpen },
  { key: "branches", groupKey: "command.groupSettings", labelKey: "command.branches", hintKey: "command.branchesHint", to: "/admin/branches", icon: Building2 },
  { key: "tables", groupKey: "command.groupSettings", labelKey: "command.tables", hintKey: "command.tablesHint", to: "/admin/tables", icon: QrCode },
  { key: "settings", groupKey: "command.groupSettings", labelKey: "command.settings", hintKey: "command.settingsHint", to: "/admin/settings", icon: Settings },
  { key: "addProduct", groupKey: "command.groupActions", labelKey: "command.addProduct", hintKey: "command.addProductHint", to: "/admin/products?intent=create", icon: Plus },
  { key: "addCategory", groupKey: "command.groupActions", labelKey: "command.addCategory", hintKey: "command.addCategoryHint", to: "/admin/categories?intent=create", icon: Plus },
  { key: "addTable", groupKey: "command.groupActions", labelKey: "command.addTable", hintKey: "command.addTableHint", to: "/admin/tables?intent=create", icon: QrCode },
];

export default function AppCommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return actions.filter((action) => {
      const label = t(action.labelKey).toLowerCase();
      const hint = t(action.hintKey).toLowerCase();
      return !normalized || `${label} ${hint}`.includes(normalized);
    });
  }, [query, t]);
  const grouped = useMemo(() => filtered.reduce((groups, action) => {
    const key = action.groupKey;
    groups[key] = [...(groups[key] || []), action];
    return groups;
  }, {}), [filtered]);

  const runAction = (to) => {
    navigate(to);
    onClose?.();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-70 grid place-items-start bg-slate-950/45 px-4 py-20 backdrop-blur-sm sm:place-items-center sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
            aria-describedby="command-palette-description"
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <h2 id="command-palette-title" className="sr-only">{t("command.title")}</h2>
            <p id="command-palette-description" className="sr-only">{t("command.footer")}</p>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("command.placeholder")}
                aria-label={t("command.placeholder")}
                className="h-11 w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              <kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-500 sm:inline-block">Esc</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length ? Object.entries(grouped).map(([groupKey, groupActions]) => (
                <section key={groupKey} className="py-1" aria-labelledby={`${groupKey}-heading`}>
                  <h3 id={`${groupKey}-heading`} className="px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-400">{t(groupKey)}</h3>
                  {groupActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none"
                        onClick={() => runAction(action.to)}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-black text-slate-950">{t(action.labelKey)}</span>
                          <span className="mt-0.5 block text-sm text-slate-500">{t(action.hintKey)}</span>
                        </span>
                      </button>
                    );
                  })}
                </section>
              )) : (
                <div className="p-6 text-center">
                  <p className="font-black text-slate-950">{t("command.noResults")}</p>
                  <p className="mt-2 text-sm text-slate-500">{t("command.backendSearchTodo")}</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              {t("command.footer")}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
