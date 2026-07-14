import { CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AppCard } from "../../design-system/components";
import { money } from "../../utils/cart";
import { getPreferredLocale, normalizeLocale, t } from "../../utils/localization";

export default function DemoOrderStatusPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const order = location.state?.order;
  const menuPath = order?.shop?.slug
    ? `/menu/${order.shop.slug}?branch=${order.branch?.id || ""}&table=${order.dining_table?.table_code || ""}&locale=${locale}`
    : "/demo";

  return (
    <div className="mx-auto min-h-dvh max-w-2xl bg-slate-50 p-4 py-8" lang={locale}>
      <div className="rounded-4xl bg-[linear-gradient(135deg,#0F172A,#1D4ED8)] p-6 text-white sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-emerald-950"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></div>
        <p className="mt-6 text-xs font-black uppercase tracking-wider text-blue-200">{t(locale, "demoPreview")}</p>
        <h1 className="khmer-heading mt-2 text-3xl font-black">{t(locale, "demoOrderTitle")}</h1>
        <p className="khmer-text mt-3 text-sm leading-7 text-slate-200">{location.state?.message || t(locale, "demoOrderDescription")}</p>
      </div>

      <AppCard className="mt-5" title={order ? order.order_number : t(locale, "demoPreview")} bodyClassName="grid gap-3 p-5">
        {order?.items?.map((item, index) => (
          <div key={`${item.product_name}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm">
            <span className="khmer-text font-bold text-slate-700">{item.quantity} × {item.product_name}</span>
            <span className="font-black text-slate-950">{money(item.total_price)} {order.currency_code}</span>
          </div>
        ))}
        {order ? <div className="flex items-center justify-between text-lg font-black"><span>{t(locale, "total")}</span><span>{money(order.grand_total)} {order.currency_code}</span></div> : null}
      </AppCard>

      <div className="mt-5 flex items-start gap-3 rounded-3xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="khmer-text text-sm font-semibold leading-6">{t(locale, "demoOrderSafety")}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link to={menuPath} className="khmer-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"><RotateCcw className="h-4 w-4" />{t(locale, "demoTryAgain")}</Link>
        <Link to="/demo" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-100">{t(locale, "demoChooseView")}</Link>
      </div>
    </div>
  );
}
