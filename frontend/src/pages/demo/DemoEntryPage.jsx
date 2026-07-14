import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LayoutDashboard, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../api/axios";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import { useAuth } from "../../context/AuthContext";
import { AppButton, AppCard } from "../../design-system/components";
import useLanguage from "../../i18n/useLanguage";

export default function DemoEntryPage() {
  const { language, t } = useLanguage();
  const { startDemo } = useAuth();
  const navigate = useNavigate();
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get("/demo/workspace")
      .then((response) => {
        if (active) setDemo(response.data.data);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, t("demo.unavailable")));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [t]);

  const openAdminDemo = async () => {
    setStarting(true);
    setError("");

    try {
      const sessionDemo = await startDemo();
      navigate(sessionDemo?.admin_path || "/admin?tour=1", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, t("demo.unavailable")));
      setStarting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#DBEAFE_0%,#F8FAFC_38%,#F8FAFC_100%)] px-4 py-5 text-slate-950 sm:px-6 sm:py-8" lang={language}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <AppLogo to="/" size="md" ariaLabel={t("navbar.goDashboard", "Go to MenuDIGI home")} />
        <LanguageToggle compact />
      </header>

      <main className="mx-auto max-w-6xl py-10 sm:py-16">
        <Link to="/" className="khmer-button inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("demo.back")}
        </Link>

        <div className="mt-8 max-w-3xl">
          <span className="khmer-label inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-black text-blue-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("demo.eyebrow")}
          </span>
          <h1 className="khmer-heading mt-5 text-3xl font-black leading-tight sm:text-5xl">{t("demo.title")}</h1>
          <p className="khmer-text mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{t("demo.description")}</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AppCard className="border-blue-200 bg-white/90" bodyClassName="flex h-full flex-col p-6 sm:p-8">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><QrCode className="h-6 w-6" aria-hidden="true" /></div>
            <p className="khmer-label mt-6 text-xs font-black text-blue-600">{t("demo.customerEyebrow")}</p>
            <h2 className="khmer-heading mt-2 text-2xl font-black">{t("demo.customerTitle")}</h2>
            <p className="khmer-text mt-3 flex-1 text-sm leading-7 text-slate-600">{t("demo.customerCopy")}</p>
            {demo?.customer_path ? (
              <Link to={demo.customer_path} className="khmer-button mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700">
                {t("demo.openCustomer")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <AppButton className="mt-6 w-full" disabled>{loading ? t("common.loading") : t("demo.unavailable")}</AppButton>
            )}
          </AppCard>

          <AppCard className="border-slate-200 bg-slate-950 text-white" bodyClassName="flex h-full flex-col p-6 sm:p-8">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-blue-200"><LayoutDashboard className="h-6 w-6" aria-hidden="true" /></div>
            <p className="khmer-label mt-6 text-xs font-black text-blue-300">{t("demo.adminEyebrow")}</p>
            <h2 className="khmer-heading mt-2 text-2xl font-black">{t("demo.adminTitle")}</h2>
            <p className="khmer-text mt-3 flex-1 text-sm leading-7 text-slate-300">{t("demo.adminCopy")}</p>
            <AppButton className="mt-6 w-full bg-white text-slate-950 hover:bg-blue-50" onClick={openAdminDemo} disabled={loading || starting || !demo} iconRight={<ArrowRight className="h-4 w-4" />}>
              {starting ? t("demo.starting") : t("demo.openAdmin")}
            </AppButton>
          </AppCard>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950" role="note">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="khmer-text text-sm font-semibold leading-6">{t("demo.safety").replace("{{hours}}", demo?.reset_interval_hours || 24)}</p>
        </div>
        {error ? <p className="khmer-text mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">{error}</p> : null}
      </main>
    </div>
  );
}
