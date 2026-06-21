import { CheckCircle2, Circle, ExternalLink, Store } from "lucide-react";
import { Link } from "react-router-dom";
import AppCard from "../../design-system/components/AppCard";
import useLanguage from "../../i18n/useLanguage";

export default function SettingsCompletionCard({
  shop,
  settings,
  branches = [],
  categories = [],
  products = [],
  tables = [],
  loading = false,
}) {
  const { t } = useLanguage();
  const checks = buildChecks({ shop, settings, branches, categories, products, tables, t });
  const complete = checks.filter((item) => item.complete).length;
  const percent = checks.length ? Math.round((complete / checks.length) * 100) : 0;
  const nextAction = checks.find((item) => !item.complete);

  return (
    <AppCard
      title={t("settingsCompletion.title", "Setup completion")}
      description={t("settingsCompletion.description", "Based only on saved shop, catalog, branch, table, and notification data.")}
      className="h-fit"
      bodyClassName="grid gap-4"
    >
      <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="khmer-label text-xs font-black uppercase text-blue-700">{t("settingsCompletion.score", "Completion score")}</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "…" : `${percent}%`}</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm">
            <Store className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${loading ? 15 : percent}%` }} />
        </div>
      </div>

      <div className="grid gap-2">
        {checks.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            {item.complete ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="khmer-heading text-sm font-black text-slate-900">{item.label}</p>
              <p className="khmer-text mt-0.5 text-xs leading-5 text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {nextAction ? (
        <Link
          to={nextAction.to}
          className="khmer-button inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {t("settingsCompletion.nextAction", "Next action")}: {nextAction.action}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">
          {t("settingsCompletion.ready", "Your core QR menu setup is ready.")}
        </p>
      )}
    </AppCard>
  );
}

function buildChecks({ shop, settings, branches, categories, products, tables, t }) {
  const profileComplete = Boolean(shop?.name && shop?.phone && shop?.address && shop?.description);
  const hasBranch = branches.length > 0;
  const hasCategory = categories.length > 0;
  const hasProduct = products.length > 0;
  const hasTable = tables.length > 0;
  const brandingBasic = Boolean(shop?.primary_color || shop?.logo_path || shop?.cover_path);
  const paymentReady = Boolean(settings?.cash_enabled || settings?.aba_enabled || settings?.bakong_enabled);
  const telegramReady = Boolean(settings?.telegram_enabled && settings?.telegram_chat_id);
  const publicReady = Boolean(shop?.status === "active" && hasCategory && hasProduct);

  return [
    {
      id: "profile",
      complete: profileComplete,
      label: t("settingsCompletion.profile.label", "Shop profile complete"),
      description: t("settingsCompletion.profile.description", "Name, phone, address, and description are saved."),
      action: t("settingsCompletion.profile.action", "Complete shop profile"),
      to: "/admin/settings#profile",
    },
    {
      id: "branding",
      complete: brandingBasic,
      label: t("settingsCompletion.branding.label", "Branding basics saved"),
      description: t("settingsCompletion.branding.description", "Saved colors or images help customers recognize the restaurant."),
      action: t("settingsCompletion.branding.action", "Review branding"),
      to: "/admin/settings#branding",
    },
    {
      id: "branch",
      complete: hasBranch,
      label: t("settingsCompletion.branch.label", "Branch exists"),
      description: t("settingsCompletion.branch.description", "At least one branch is available for orders and tables."),
      action: t("settingsCompletion.branch.action", "Add branch"),
      to: "/admin/branches",
    },
    {
      id: "category",
      complete: hasCategory,
      label: t("settingsCompletion.category.label", "Category exists"),
      description: t("settingsCompletion.category.description", "Menu items have a customer-facing category."),
      action: t("settingsCompletion.category.action", "Add category"),
      to: "/admin/categories",
    },
    {
      id: "product",
      complete: hasProduct,
      label: t("settingsCompletion.product.label", "Product exists"),
      description: t("settingsCompletion.product.description", "At least one product can appear on the QR menu."),
      action: t("settingsCompletion.product.action", "Add product"),
      to: "/admin/products",
    },
    {
      id: "table",
      complete: hasTable,
      label: t("settingsCompletion.table.label", "Table QR exists"),
      description: t("settingsCompletion.table.description", "At least one saved table QR is available for dine-in ordering."),
      action: t("settingsCompletion.table.action", "Add table QR"),
      to: "/admin/tables",
    },
    {
      id: "payments",
      complete: paymentReady,
      label: t("settingsCompletion.payments.label", "Payment method configured"),
      description: t("settingsCompletion.payments.description", "At least one checkout payment method is enabled."),
      action: t("settingsCompletion.payments.action", "Configure payments"),
      to: "/admin/settings#payments",
    },
    {
      id: "notifications",
      complete: telegramReady,
      label: t("settingsCompletion.notifications.label", "Admin notification channel ready"),
      description: t("settingsCompletion.notifications.description", "Telegram is enabled with a saved chat ID."),
      action: t("settingsCompletion.notifications.action", "Configure Telegram"),
      to: "/admin/settings#notifications",
    },
    {
      id: "public",
      complete: publicReady,
      label: t("settingsCompletion.public.label", "Public QR menu ready"),
      description: t("settingsCompletion.public.description", "The shop is active and has saved menu content."),
      action: t("settingsCompletion.public.action", "Prepare menu"),
      to: "/admin/products",
    },
  ];
}
