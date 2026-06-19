import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ExternalLink, QrCode } from "lucide-react";
import { AppButton, AppCard } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";

const setupItems = [
  { key: "shop", labelKey: "onboarding.shopProfile", helpKey: "onboarding.shopProfileHelp", to: "/admin/shops", known: ({ shops }) => shops.length > 0 },
  { key: "branch", labelKey: "onboarding.firstBranch", helpKey: "onboarding.firstBranchHelp", to: "/admin/branches" },
  { key: "category", labelKey: "onboarding.firstCategory", helpKey: "onboarding.firstCategoryHelp", to: "/admin/categories" },
  { key: "product", labelKey: "onboarding.firstProduct", helpKey: "onboarding.firstProductHelp", to: "/admin/products" },
  { key: "table", labelKey: "onboarding.tableQr", helpKey: "onboarding.tableQrHelp", to: "/admin/tables" },
  { key: "publicMenu", labelKey: "onboarding.publicMenu", helpKey: "onboarding.publicMenuHelp", to: "/admin/products" },
  { key: "testOrder", labelKey: "onboarding.testOrder", helpKey: "onboarding.testOrderHelp", to: "/admin/orders", known: ({ orders }) => orders.length > 0 },
];

export default function SetupChecklist({ shops = [], orders = [] }) {
  const { t } = useLanguage();
  const context = { shops, orders };
  const items = setupItems.map((item) => {
    const known = item.known?.(context);
    return { ...item, complete: Boolean(known), review: known === undefined };
  });
  const completed = items.filter((item) => item.complete).length;
  const progress = Math.round((completed / items.length) * 100);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }}>
      <AppCard className="overflow-hidden border-blue-100 bg-linear-to-br from-white to-blue-50/50" bodyClassName="p-5">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-wide text-blue-700">{t("onboarding.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{t("onboarding.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("onboarding.description")}</p>
            <div className="mt-5" aria-label={t("onboarding.progressLabel", "Setup progress")}>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                <span>{t("onboarding.progress")}</span>
                <span>{completed}/{items.length}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            {items.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="flex min-w-0 items-start gap-3">
                  {item.complete ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-black text-slate-950">{t(item.labelKey)}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {item.review ? t("onboarding.reviewNeeded") : t(item.helpKey)}
                    </span>
                  </span>
                </span>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" aria-hidden="true" />
              </Link>
            ))}
            <div className="pt-2">
              <AppButton as={Link} to="/admin/products" size="sm" variant="outline">{t("onboarding.primaryAction")}</AppButton>
            </div>
          </div>
        </div>
      </AppCard>
    </motion.section>
  );
}
