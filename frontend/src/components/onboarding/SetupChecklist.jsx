import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ExternalLink, QrCode } from "lucide-react";
import { getApiErrorMessage } from "../../api/axios";
import { AppButton, AppCard, AppEmptyState, AppSkeleton } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";

export default function SetupChecklist({ onboarding }) {
  const { t } = useLanguage();
  const { status, loading, error, retry, saving, dismiss, resume } = onboarding;

  if (loading) return <AppSkeleton className="min-h-64" />;

  if (error) {
    return (
      <AppEmptyState
        title={t("onboarding.loadErrorTitle")}
        description={getApiErrorMessage(error, t("onboarding.loadErrorCopy"))}
        actionLabel={t("onboarding.retry")}
        onAction={retry}
      />
    );
  }

  if (!status || status.shop?.is_demo) return null;

  if (status.is_dismissed) {
    return (
      <AppCard className="border-slate-200 bg-slate-50/80" bodyClassName="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="khmer-heading font-black text-slate-900">{t("onboarding.dismissedTitle")}</p>
          <p className="khmer-text mt-1 text-sm text-slate-600">{t("onboarding.dismissedCopy")}</p>
        </div>
        <AppButton type="button" variant="secondary" size="sm" loading={saving} onClick={resume}>{t("onboarding.resume")}</AppButton>
      </AppCard>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }}>
      <AppCard className="overflow-hidden border-blue-100 bg-linear-to-br from-white to-blue-50/50" bodyClassName="p-5">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="khmer-label mt-4 text-xs font-black text-blue-700">{t("onboarding.eyebrow")}</p>
            <h2 className="khmer-heading mt-2 text-2xl font-black text-slate-950">{status.is_complete ? t("onboarding.completeTitle") : t("onboarding.title")}</h2>
            <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{status.is_complete ? t("onboarding.completeCopy") : t("onboarding.description")}</p>
            <div className="mt-5" aria-label={t("onboarding.progressLabel")}>
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span className="khmer-label">{t("onboarding.progress")}</span>
                <span>{status.completed_count}/{status.total_steps}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${status.progress_percent}%` }} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <AppButton as={Link} to="/admin/onboarding" size="sm">{status.is_complete ? t("onboarding.reviewSetup") : t("onboarding.primaryAction")}</AppButton>
              {!status.is_complete ? <AppButton type="button" variant="ghost" size="sm" loading={saving} onClick={dismiss}>{t("onboarding.dismiss")}</AppButton> : null}
            </div>
          </div>
          <div className="grid gap-2">
            {status.steps.map((item) => (
              <Link
                key={item.key}
                to={item.action_path}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="flex min-w-0 items-start gap-3">
                  {item.complete ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />}
                  <span className="min-w-0">
                    <span className="khmer-heading block font-black text-slate-950">{t(`onboarding.steps.${item.key}.label`)}</span>
                    <span className="khmer-text mt-1 block text-sm leading-5 text-slate-500">{item.complete ? t(`onboarding.steps.${item.key}.complete`) : t(`onboarding.steps.${item.key}.help`)}</span>
                  </span>
                </span>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </AppCard>
    </motion.section>
  );
}
