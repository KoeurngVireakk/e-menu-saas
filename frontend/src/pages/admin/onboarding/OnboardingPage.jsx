import { CheckCircle2, Circle, ExternalLink, Eye, Printer, Rocket, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/axios";
import { toastSuccess } from "../../../components/ui";
import { AppButton, AppCard, AppEmptyState, AppPageHeader, AppSkeleton } from "../../../design-system/components";
import useLanguage from "../../../i18n/useLanguage";
import useOnboarding from "../../../hooks/useOnboarding";

export default function OnboardingPage() {
  const { t } = useLanguage();
  const onboarding = useOnboarding();
  const { status, loading, error, retry, saving, mutationError, completeStep, dismiss, resume } = onboarding;

  if (loading) return <AppSkeleton variant="page" />;
  if (error || !status) {
    return <AppEmptyState title={t("onboarding.loadErrorTitle")} description={getApiErrorMessage(error, t("onboarding.loadErrorCopy"))} actionLabel={t("onboarding.retry")} onAction={retry} />;
  }

  const current = status.steps.find((step) => step.key === status.current_step) || status.steps.find((step) => !step.complete);
  const onPrimaryAction = async () => {
    if (current?.key === "public_menu_preview") {
      await completeStep("public_menu_preview");
      if (status.preview_path) window.open(status.preview_path, "_blank", "noopener,noreferrer");
      await toastSuccess(t("onboarding.previewConfirmed"));
    } else if (current?.key === "workspace_ready") {
      await completeStep("workspace_ready");
      await toastSuccess(t("onboarding.readyConfirmed"));
    }
  };

  return (
    <div className="grid min-w-0 gap-6">
      <AppPageHeader
        eyebrow={t("onboarding.eyebrow")}
        title={t("onboarding.pageTitle")}
        description={t("onboarding.pageDescription")}
        secondaryActions={status.is_dismissed
          ? <AppButton type="button" variant="secondary" loading={saving} onClick={resume}>{t("onboarding.resume")}</AppButton>
          : (!status.is_complete ? <AppButton type="button" variant="ghost" loading={saving} onClick={dismiss}>{t("onboarding.dismiss")}</AppButton> : null)}
      />

      <AppCard className="overflow-hidden border-blue-100 bg-[linear-gradient(135deg,#EFF6FF,#FFFFFF)]" bodyClassName="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="khmer-label text-xs font-black text-blue-700">{status.shop?.name || t("onboarding.newWorkspace")}</p>
          <h2 className="khmer-heading mt-2 text-2xl font-black text-slate-950">{status.is_complete ? t("onboarding.completeTitle") : t("onboarding.currentGoal")}</h2>
          <p className="khmer-text mt-2 max-w-2xl text-sm leading-6 text-slate-600">{status.is_complete ? t("onboarding.completeCopy") : t(`onboarding.steps.${status.current_step}.preview`)}</p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-blue-100" aria-label={t("onboarding.progressLabel")}>
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${status.progress_percent}%` }} />
          </div>
          <p className="khmer-text mt-2 text-xs font-bold text-slate-500">{status.completed_count}/{status.total_steps} · {status.progress_percent}%</p>
        </div>
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Rocket className="h-9 w-9" aria-hidden="true" /></div>
      </AppCard>

      {status.is_dismissed ? (
        <AppEmptyState title={t("onboarding.dismissedTitle")} description={t("onboarding.dismissedCopy")} actionLabel={t("onboarding.resume")} onAction={resume} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <AppCard title={t("onboarding.checklistTitle")} description={t("onboarding.checklistCopy")} bodyClassName="grid gap-2 p-4 sm:p-5">
            {status.steps.map((step, index) => (
              <div key={step.key} className={`rounded-2xl border p-4 ${step.key === status.current_step && !step.complete ? "border-blue-300 bg-blue-50/70" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start gap-3">
                  {step.complete ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />}
                  <div className="min-w-0 flex-1">
                    <p className="khmer-label text-[11px] font-black text-slate-400">{String(index + 1).padStart(2, "0")}</p>
                    <h3 className="khmer-heading mt-1 font-black text-slate-950">{t(`onboarding.steps.${step.key}.label`)}</h3>
                    <p className="khmer-text mt-1 text-sm leading-6 text-slate-600">{step.complete ? t(`onboarding.steps.${step.key}.complete`) : t(`onboarding.steps.${step.key}.help`)}</p>
                    {step.key === status.current_step && !step.complete ? (
                      <div className="mt-3">
                        {step.key === "public_menu_preview" || step.key === "workspace_ready" ? (
                          <AppButton type="button" size="sm" loading={saving} onClick={onPrimaryAction} iconRight={step.key === "public_menu_preview" ? <ExternalLink className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}>
                            {t(`onboarding.steps.${step.key}.action`)}
                          </AppButton>
                        ) : (
                          <AppButton as={Link} to={step.action_path} size="sm" iconRight={<ExternalLink className="h-4 w-4" />}>{t(`onboarding.steps.${step.key}.action`)}</AppButton>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </AppCard>

          <div className="grid gap-4 lg:sticky lg:top-24">
            <AppCard title={t("onboarding.outcomeTitle")} description={t("onboarding.outcomeCopy")} bodyClassName="grid gap-3">
              {["customerMenu", "tableOrdering", "teamWorkflow"].map((key) => (
                <div key={key} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3"><Store className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><span className="khmer-text text-sm font-semibold leading-6 text-slate-700">{t(`onboarding.outcomes.${key}`)}</span></div>
              ))}
            </AppCard>

            {(status.is_complete || status.completed_steps.includes("public_menu_preview")) && status.preview_path ? (
              <AppCard title={t("onboarding.finalActionsTitle")} description={t("onboarding.finalActionsCopy")} bodyClassName="grid gap-2">
                <AppButton as={Link} to={status.preview_path} target="_blank" rel="noreferrer" variant="outline" iconLeft={<Eye className="h-4 w-4" />}>{t("onboarding.previewMenu")}</AppButton>
                <AppButton as={Link} to={status.qr_action_path || "/admin/tables"} variant="secondary" iconLeft={<Printer className="h-4 w-4" />}>{t("onboarding.printQr")}</AppButton>
              </AppCard>
            ) : null}
          </div>
        </div>
      )}

      {mutationError ? <p className="khmer-text rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">{getApiErrorMessage(mutationError, t("onboarding.updateError"))}</p> : null}
    </div>
  );
}
