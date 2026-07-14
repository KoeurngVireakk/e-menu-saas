import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, RotateCcw, ShieldCheck, X } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import useLanguage from "../../i18n/useLanguage";

const tourSteps = [
  { key: "overview", path: "/admin" },
  { key: "customer", customer: true },
  { key: "orders", path: "/admin/orders" },
  { key: "kitchen", path: "/admin/kitchen" },
  { key: "payments", path: "/admin/payments" },
  { key: "reports", path: "/admin/reports" },
];

export default function DemoWorkspaceBanner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const demoShop = useMemo(() => user?.shops?.find((shop) => shop.is_demo), [user]);
  const [metadata, setMetadata] = useState(null);
  const [tourOpen, setTourOpen] = useState(searchParams.get("tour") === "1");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!demoShop) return undefined;
    let active = true;
    api.get("/demo/workspace").then((response) => {
      if (active) setMetadata(response.data.data);
    }).catch(() => {});
    return () => { active = false; };
  }, [demoShop]);

  if (!demoShop) return null;

  const current = tourSteps[step];
  const closeTour = () => {
    setTourOpen(false);
    if (searchParams.get("tour") === "1") navigate(location.pathname, { replace: true });
  };
  const advance = () => {
    if (step === tourSteps.length - 1) {
      closeTour();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    const next = tourSteps[nextStep];
    if (next.path) navigate(next.path);
  };

  return (
    <>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 md:px-6 lg:px-8" role="status">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="khmer-heading text-sm font-black text-amber-950">{t("demo.bannerTitle")}</p>
              <p className="khmer-text mt-0.5 text-xs font-semibold leading-5 text-amber-800">{t("demo.bannerCopy").replace("{{hours}}", metadata?.reset_interval_hours || 24)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {metadata?.customer_path ? <Link to={metadata.customer_path} target="_blank" rel="noreferrer" className="khmer-button inline-flex min-h-9 items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 text-xs font-black text-amber-900"><Eye className="h-3.5 w-3.5" />{t("demo.viewMenu")}</Link> : null}
            <button type="button" onClick={() => { setStep(0); setTourOpen(true); }} className="khmer-button inline-flex min-h-9 items-center gap-2 rounded-xl bg-amber-900 px-3 text-xs font-black text-white hover:bg-slate-950"><RotateCcw className="h-3.5 w-3.5" />{t("demo.startTour")}</button>
          </div>
        </div>
      </div>

      {tourOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-slate-950/45 p-3 sm:place-items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="demo-tour-title">
          <div className="w-full max-w-lg rounded-4xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="khmer-label text-xs font-black text-blue-600">{t("demo.tourProgress").replace("{{current}}", step + 1).replace("{{total}}", tourSteps.length)}</p>
                <h2 id="demo-tour-title" className="khmer-heading mt-2 text-2xl font-black text-slate-950">{t(`demo.tour.${current.key}Title`)}</h2>
              </div>
              <button type="button" onClick={closeTour} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label={t("common.close")}><X className="h-5 w-5" /></button>
            </div>
            <p className="khmer-text mt-4 text-sm leading-7 text-slate-600">{t(`demo.tour.${current.key}Copy`)}</p>
            {current.customer && metadata?.customer_path ? <Link to={metadata.customer_path} target="_blank" rel="noreferrer" className="khmer-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-blue-50 px-4 text-sm font-black text-blue-700 hover:bg-blue-100">{t("demo.openCustomer")}<ArrowRight className="h-4 w-4" /></Link> : null}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="khmer-button min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600 hover:bg-slate-100 disabled:opacity-40">{t("demo.previous")}</button>
              <button type="button" onClick={advance} className="khmer-button inline-flex min-h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700">{step === tourSteps.length - 1 ? t("demo.finish") : t("demo.next")}<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
