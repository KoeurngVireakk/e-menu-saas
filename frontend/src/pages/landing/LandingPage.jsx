import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  CreditCard,
  Languages,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  QrCode,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  UploadCloud,
  Utensils,
  X,
} from "lucide-react";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import useLanguage from "../../i18n/useLanguage";

const navItems = [
  ["nav.howItWorks", "#how-it-works"],
  ["nav.features", "#features"],
  ["landing.navDashboard", "#dashboard-preview"],
  ["nav.pricing", "#pricing"],
  ["nav.faq", "#faq"],
];

const featureIcons = {
  qrMenuBuilder: QrCode,
  tableQrGenerator: ScanLine,
  customerMobileOrdering: ShoppingCart,
  cartAndCheckout: ReceiptText,
  kitchenDisplay: ChefHat,
  paymentProofReview: CreditCard,
  reportsAnalytics: BarChart3,
  khmerEnglish: Languages,
};

const audienceIcons = [Store, Utensils, ShoppingCart, LayoutDashboard, BellRing, CreditCard];

function getMotion(reduced, delay = 0) {
  if (reduced) return {};

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.34, ease: "easeOut", delay },
  };
}

export default function LandingPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950" lang={language}>
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeatureBentoSection />
        <DashboardPreviewSection />
        <CustomerFlowSection />
        <PaymentReadySection />
        <AudienceSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8" aria-label={t("landing.mainNavigation")}>
        <AppLogo to="/" size="md" ariaLabel={t("navbar.goDashboard", "Go to MenuDIGI home")} />
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="khmer-button text-sm font-black text-slate-600 transition hover:text-blue-700">
              {t(labelKey)}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link to="/login" className="khmer-button rounded-2xl px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100">
            {t("common.signIn")}
          </Link>
          <Link to="/register" className="khmer-button inline-flex min-h-10 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
            {t("landing.heroPrimary")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label={open ? t("landing.closeNavigation") : t("landing.openNavigation")}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-2xl text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} className="overflow-hidden border-t border-slate-100 bg-white lg:hidden">
        <div className="grid gap-2 px-4 py-4">
          <LanguageToggle className="mb-2 w-fit" />
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="khmer-button rounded-2xl px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={close}>
              {t(labelKey)}
            </a>
          ))}
          <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">
            <Link to="/login" className="khmer-button rounded-2xl px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={close}>{t("common.signIn")}</Link>
            <Link to="/register" className="khmer-button rounded-2xl bg-blue-600 px-3 py-3 text-center text-sm font-black text-white hover:bg-blue-700" onClick={close}>{t("landing.heroPrimary")}</Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

function HeroSection() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_82%_8%,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#EEF4FF_58%,#F8FAFC_100%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <motion.div {...getMotion(reduced)} className="relative z-10 max-w-3xl">
          <div className="khmer-label inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black text-blue-700 shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("landing.badge")}
          </div>
          <h1 className="khmer-heading mt-6 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            {t("landing.headline")}
          </h1>
          <p className="khmer-text mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t("landing.subheadline")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="khmer-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]">
              {t("landing.heroPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#customer-preview" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.98]">
              {t("landing.heroSecondary")}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {t("landing.trustPoints", []).map((item) => (
              <span key={item} className="khmer-text inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();
  const floatMotion = reduced ? {} : {
    animate: { y: [0, -10, 0] },
    transition: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <motion.div {...getMotion(reduced, 0.08)} className="relative mx-auto h-[620px] w-full max-w-[640px] sm:h-[680px] lg:h-[720px]" aria-label={t("landing.heroVisualLabel")}>
      <div className="absolute inset-x-8 top-12 h-80 rounded-full bg-blue-100/60 blur-3xl" aria-hidden="true" />
      <div className="absolute right-4 top-7 h-28 w-28 rounded-full bg-amber-100" aria-hidden="true" />
      <div className="absolute bottom-16 left-2 h-20 w-20 rounded-full bg-emerald-100" aria-hidden="true" />

      <motion.div {...floatMotion} className="absolute left-1/2 top-8 z-20 w-[270px] -translate-x-1/2 sm:w-[315px]">
        <PhoneMockup />
      </motion.div>

      <FloatingCard className="left-0 top-20 z-30 max-w-[190px]" icon={<QrCode className="h-5 w-5" />} title={t("landing.floating.qrTitle")} copy={t("landing.floating.qrCopy")} />
      <FloatingCard className="right-0 top-28 z-30 max-w-[210px]" icon={<ReceiptText className="h-5 w-5" />} title={t("landing.floating.orderTitle")} copy={t("landing.floating.orderCopy")} />
      <FloatingCard className="bottom-28 left-2 z-30 max-w-[210px]" icon={<CreditCard className="h-5 w-5" />} title={t("landing.floating.paymentTitle")} copy={t("landing.floating.paymentCopy")} />
      <FloatingCard className="bottom-8 right-2 z-30 max-w-[220px]" icon={<ChefHat className="h-5 w-5" />} title={t("landing.floating.kitchenTitle")} copy={t("landing.floating.kitchenCopy")} />

      <div className="absolute bottom-0 left-1/2 z-10 w-[min(100%,560px)] -translate-x-1/2 rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur">
        <DashboardMiniPreview />
      </div>
    </motion.div>
  );
}

function FloatingCard({ icon, title, copy, className }) {
  return (
    <div className={`absolute hidden rounded-3xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:block ${className}`}>
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">{icon}</div>
      <p className="khmer-heading mt-3 text-sm font-black text-slate-950">{title}</p>
      <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-500">{copy}</p>
    </div>
  );
}

function PhoneMockup() {
  const { t } = useLanguage();
  const products = t("landing.products", []);
  const categories = t("landing.categories", []);

  return (
    <div className="rounded-[3rem] border border-slate-900 bg-slate-950 p-3 shadow-2xl shadow-slate-950/30">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50">
        <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" aria-hidden="true" />
        <div className="bg-slate-950 px-5 pb-5 pt-12 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="khmer-text text-xs font-bold text-blue-200">{t("landing.phoneRestaurant")}</p>
              <p className="khmer-heading mt-1 text-xl font-black">MenuDIGI</p>
            </div>
            <span className="khmer-text rounded-full bg-white/15 px-3 py-1 text-xs font-black">{t("landing.tableBadge")}</span>
          </div>
          <div className="mt-5 flex gap-2 overflow-hidden">
            {categories.map((item, index) => (
              <span key={item} className={`khmer-text shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${index === 0 ? "bg-white text-slate-950" : "bg-white/15 text-white"}`}>{item}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-4">
          {products.map((item, index) => (
            <div key={item} className="grid grid-cols-[58px_1fr] gap-3 rounded-3xl bg-white p-3 shadow-sm">
              <FoodSwatch index={index} />
              <div className="min-w-0">
                <p className="khmer-heading truncate text-sm font-black text-slate-950">{item}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{index === 0 ? "$3.50" : index === 1 ? "$6.00" : "$3.00"}</p>
                <div className="mt-2 h-2 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/20">
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span className="khmer-text">{t("landing.cartSummary")}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3">
            <p className="khmer-label text-xs font-black text-slate-500">{t("common.orderStatus")}</p>
            <p className="khmer-text text-sm font-black text-slate-950">{t("landing.statusPreview")}</p>
            <div className="flex flex-wrap gap-2">
              <span className="khmer-text rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">{t("landing.paymentBadge")}</span>
              <span className="khmer-text rounded-full bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700">{t("landing.realtimeBadge")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FoodSwatch({ index }) {
  const colors = [
    "from-amber-200 via-orange-100 to-blue-50",
    "from-rose-100 via-amber-100 to-slate-50",
    "from-emerald-100 via-lime-100 to-blue-50",
  ];

  return (
    <div className={`relative h-16 overflow-hidden rounded-2xl bg-linear-to-br ${colors[index % colors.length]}`}>
      <div className="absolute left-3 top-3 h-8 w-8 rounded-full bg-white/70" aria-hidden="true" />
      <div className="absolute bottom-2 right-2 h-5 w-9 rounded-full bg-white/60" aria-hidden="true" />
    </div>
  );
}

function DashboardMiniPreview() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="khmer-label text-xs font-black text-blue-600">{t("landing.dashboardTitle")}</p>
          <p className="khmer-heading mt-1 text-lg font-black text-slate-950">MenuDIGI OS</p>
        </div>
        <LayoutDashboard className="h-6 w-6 text-blue-600" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {t("landing.dashboardMetrics", []).map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-3">
            <p className="khmer-label text-[11px] font-black text-slate-500">{label}</p>
            <p className="khmer-text mt-1 text-sm font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <Section id="how-it-works" eyebrow={t("nav.howItWorks")} title={t("landing.sections.howTitle")} description={t("landing.sections.howCopy")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {t("landing.steps", []).map(([number, title, copy], index) => {
          const Icon = [Package, QrCode, ScanLine, LayoutDashboard][index] || Check;
          return (
            <div key={number} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{number}</div>
                <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="khmer-heading mt-5 text-lg font-black text-slate-950">{title}</h3>
              <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function FeatureBentoSection() {
  const { t } = useLanguage();
  const features = t("landing.bentoFeatures", []);

  return (
    <Section id="features" eyebrow={t("nav.features")} title={t("landing.sections.featuresTitle")} description={t("landing.sections.featuresCopy")}>
      <div className="grid gap-4 lg:grid-cols-6">
        {features.map(([key, title, copy], index) => {
          const Icon = featureIcons[key] || Utensils;
          const span = index === 0 || index === 4 ? "lg:col-span-3" : "lg:col-span-2";
          return (
            <article key={key} className={`premium-interactive rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 ${span}`}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="khmer-heading mt-5 text-xl font-black text-slate-950">{title}</h3>
              <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function DashboardPreviewSection() {
  const { t } = useLanguage();

  return (
    <Section id="dashboard-preview" eyebrow={t("landing.dashboardEyebrow")} title={t("landing.sections.dashboardTitle")} description={t("landing.sections.dashboardCopy")}>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {t("landing.dashboardPreviewMetrics", []).map(([label, value, help]) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="khmer-label text-xs font-black text-slate-500">{label}</p>
                  <p className="khmer-text mt-3 text-2xl font-black text-slate-950">{value}</p>
                  <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-500">{help}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="khmer-heading text-lg font-black text-slate-950">{t("landing.recentOrderTitle")}</p>
              <div className="mt-3 grid gap-2">
                {t("landing.recentOrderRows", []).map(([order, status]) => (
                  <div key={order} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    <span>{order}</span>
                    <span className="khmer-text rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <PreviewPanel icon={<CreditCard className="h-5 w-5" />} title={t("landing.paymentStatusTitle")} rows={t("landing.paymentStatusRows", [])} />
            <PreviewPanel icon={<ChefHat className="h-5 w-5" />} title={t("landing.kitchenStatusTitle")} rows={t("landing.kitchenStatusRows", [])} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function PreviewPanel({ icon, title, rows }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm">{icon}</div>
        <h3 className="khmer-heading font-black text-slate-950">{title}</h3>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, status]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <span className="khmer-text">{label}</span>
            <span className="khmer-text text-xs text-slate-500">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerFlowSection() {
  const { t } = useLanguage();

  return (
    <Section id="customer-preview" eyebrow={t("landing.customerFlowEyebrow")} title={t("landing.sections.customerFlowTitle")} description={t("landing.sections.customerFlowCopy")}>
      <div className="grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="mx-auto w-full max-w-sm"><PhoneMockup /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {t("landing.customerFlow", []).map(([title, copy], index) => {
            const Icon = [ScanLine, Package, CustomizeIcon, ReceiptText, UploadCloud, Clock3][index] || Check;
            return (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <h3 className="khmer-heading mt-4 text-lg font-black text-slate-950">{title}</h3>
                <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function CustomizeIcon(props) {
  return <ShoppingCart {...props} />;
}

function PaymentReadySection() {
  const { t } = useLanguage();

  return (
    <Section eyebrow={t("common.payment")} title={t("landing.sections.paymentTitle")} description={t("landing.sections.paymentCopy")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {t("landing.paymentReadiness", []).map(([title, copy], index) => {
          const Icon = [ReceiptText, CreditCard, QrCode, ShieldCheck][index] || CreditCard;
          return (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="khmer-heading mt-4 text-lg font-black text-slate-950">{title}</h3>
              <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function AudienceSection() {
  const { t } = useLanguage();

  return (
    <Section eyebrow={t("landing.audienceEyebrow")} title={t("landing.sections.audienceTitle")} description={t("landing.sections.audienceCopy")}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {t("landing.audiences", []).map((item, index) => {
          const Icon = audienceIcons[index] || Store;
          return (
            <div key={item} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="khmer-heading font-black text-slate-950">{item}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function PricingSection() {
  const { t } = useLanguage();

  return (
    <Section id="pricing" eyebrow={t("nav.pricing")} title={t("landing.sections.pricingTitle")} description={t("landing.sections.pricingCopy")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {t("landing.pricingPlans", []).map(([name, copy, items], index) => (
          <div key={name} className={`rounded-[1.75rem] border bg-white p-6 shadow-sm ${index === 1 ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"}`}>
            <p className="khmer-label text-sm font-black text-blue-600">{name}</p>
            <h3 className="khmer-heading mt-3 text-2xl font-black text-slate-950">{t("landing.pricingPlanLabel")}</h3>
            <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <ul className="khmer-text mt-6 grid gap-3 text-sm font-bold leading-6 text-slate-700">
              {items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link to="/register" className={`khmer-button mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-black ${index === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 text-slate-800 hover:bg-slate-50"}`}>
              {t("landing.finalCreate")}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQSection() {
  const { t } = useLanguage();

  return (
    <Section id="faq" eyebrow={t("nav.faq")} title={t("landing.sections.faqTitle")}>
      <div className="grid gap-3">
        {t("landing.faqs", []).map(([question, answer]) => (
          <details key={question} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="khmer-heading flex cursor-pointer list-none items-center justify-between gap-3 font-black text-slate-950">
              {question}
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="khmer-text mt-3 text-sm leading-6 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function FinalCTASection() {
  const { t } = useLanguage();

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="khmer-label text-sm font-black text-blue-300">MenuDIGI</p>
            <h2 className="khmer-heading mt-3 text-3xl font-black leading-tight sm:text-4xl">{t("landing.sections.finalTitle")}</h2>
            <p className="khmer-text mt-4 max-w-2xl text-sm leading-6 text-slate-300">{t("landing.sections.finalCopy")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700">{t("landing.finalCreate")}</Link>
            <a href="#customer-preview" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-5 text-sm font-black text-white hover:bg-white/10">{t("landing.viewDemo")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <AppLogo to="/" size="sm" ariaLabel={t("navbar.goDashboard", "Go to MenuDIGI home")} />
          <p className="khmer-text mt-4 max-w-sm text-sm leading-6 text-slate-600">{t("landing.footerCopy")}</p>
          <LanguageToggle className="mt-4" />
        </div>
        <FooterGroup title={t("landing.footerProduct")} links={[[t("nav.howItWorks"), "#how-it-works"], [t("nav.features"), "#features"], [t("nav.pricing"), "#pricing"]]} />
        <FooterGroup title={t("landing.footerSupport")} links={[[t("common.signIn"), "/login"], [t("common.getStarted"), "/register"], [t("nav.faq"), "#faq"]]} />
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs font-semibold text-slate-500">© {new Date().getFullYear()} MenuDIGI.</p>
    </footer>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <p className="khmer-heading font-black text-slate-950">{title}</p>
      <div className="mt-3 grid gap-2">
        {links.map(([label, href]) => href.startsWith("/") ? (
          <Link key={label} to={href} className="khmer-text text-sm font-semibold text-slate-500 hover:text-slate-950">{label}</Link>
        ) : (
          <a key={label} href={href} className="khmer-text text-sm font-semibold text-slate-500 hover:text-slate-950">{label}</a>
        ))}
      </div>
    </div>
  );
}

function Section({ id, eyebrow, title, description, children }) {
  const reduced = useReducedMotion();

  return (
    <motion.section id={id} className="px-4 py-14 lg:px-8 lg:py-20" {...getMotion(reduced)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? <p className="khmer-label text-xs font-black text-blue-600">{eyebrow}</p> : null}
          <h2 className="khmer-heading mt-3 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
          {description ? <p className="khmer-text mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
        </div>
        {children}
      </div>
    </motion.section>
  );
}
