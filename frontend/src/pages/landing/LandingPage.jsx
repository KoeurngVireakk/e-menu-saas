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
  QrCode,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Smartphone,
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
        <RestaurantWorkflowSection />
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
    <header className="sticky top-0 z-50 border-b border-slate-200/45 bg-white/88 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8" aria-label={t("landing.mainNavigation")}>
        <AppLogo to="/" size="md" ariaLabel={t("navbar.goDashboard", "Go to MenuDIGI home")} />
        <div className="hidden items-center gap-0.5 rounded-full bg-slate-950/[0.035] p-1 lg:flex">
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="khmer-button rounded-full px-3.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm hover:shadow-slate-900/4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {t(labelKey)}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link to="/login" className="khmer-button rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100/80 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {t("common.signIn")}
          </Link>
          <Link to="/register" className="khmer-button inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-sm shadow-blue-600/14 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            {t("landing.heroPrimary")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label={open ? t("landing.closeNavigation") : t("landing.openNavigation")}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-700 shadow-sm shadow-slate-900/4 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} className="overflow-hidden border-t border-slate-100 bg-white/96 lg:hidden">
        <div className="grid gap-1.5 px-4 py-4 shadow-sm shadow-slate-900/4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="khmer-label text-xs font-black text-slate-400">{t("landing.mainNavigation")}</span>
            <LanguageToggle />
          </div>
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="khmer-button rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950" onClick={close}>
              {t(labelKey)}
            </a>
          ))}
          <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">
            <Link to="/login" className="khmer-button rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={close}>{t("common.signIn")}</Link>
            <Link to="/register" className="khmer-button rounded-2xl bg-blue-600 px-3 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700" onClick={close}>{t("landing.heroPrimary")}</Link>
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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#F4F7FB_58%,#F8FAFC_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent" aria-hidden="true" />
      <div className="absolute right-0 top-24 hidden h-76 w-1/2 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.035),transparent_70%)] lg:block" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:gap-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-18 xl:py-20">
        <motion.div {...getMotion(reduced)} className="relative z-10 max-w-3xl">
          <div className="khmer-label inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm shadow-blue-950/5">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("landing.badge")}
          </div>
          <h1 className="khmer-heading mt-5 text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            {t("landing.headline")}
          </h1>
          <p className="khmer-text mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">{t("landing.subheadline")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
            <Link to="/register" className="khmer-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              {t("landing.heroPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#customer-preview" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/75 px-5 text-sm font-black text-slate-800 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              {t("landing.heroSecondary")}
            </a>
          </div>
          <div className="mt-6 hidden flex-wrap gap-x-4 gap-y-2 sm:flex">
            {t("landing.trustPoints", []).map((item) => (
              <span key={item} className="khmer-text inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Check className="h-3 w-3 text-slate-400" aria-hidden="true" />
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

  return (
    <motion.div {...getMotion(reduced, 0.08)} className="relative mx-auto h-72 w-full max-w-156 overflow-hidden sm:h-110 lg:h-126" role="img" aria-label={t("landing.heroVisualLabel")}>
      <div className="absolute inset-x-3 top-6 h-54 rounded-4xl border border-slate-200/45 bg-white/28 shadow-sm shadow-blue-950/3 sm:inset-x-8 sm:top-7 sm:h-88 lg:h-102" aria-hidden="true" />
      <div className="absolute inset-x-0 top-2 z-10 sm:right-18 sm:top-5 lg:right-22">
        <AdminHeroDashboard />
      </div>
      <div className="absolute bottom-4 right-0 z-20 w-28 sm:bottom-5 sm:w-44 lg:w-50">
        <PhoneMockup compact />
      </div>
      <HeroTableStatusBadge />
    </motion.div>
  );
}

function AdminHeroDashboard() {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-4xl border border-slate-200/70 bg-white/92 shadow-sm shadow-slate-900/4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100/80 bg-slate-50/45 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
        <span className="khmer-text rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">{t("landing.heroDashboardMode")}</span>
      </div>
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
          <div>
            <p className="khmer-label text-[11px] font-black text-blue-600">{t("landing.dashboardTitle")}</p>
            <p className="khmer-heading mt-1 text-base font-black text-slate-950 sm:text-lg">{t("landing.dashboardProductTitle")}</p>
          </div>
          <FlowDots />
        </div>
        <HeroFlowRail />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {t("landing.dashboardMetrics", []).map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50/70 p-2.5 ring-1 ring-slate-200/55">
              <p className="khmer-label text-[10px] font-black text-slate-500">{label}</p>
              <p className="khmer-text mt-1 text-xs font-bold text-slate-900 sm:text-sm">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 hidden gap-3 sm:grid sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-3">
            <p className="khmer-heading text-sm font-black text-slate-950">{t("landing.recentOrderTitle")}</p>
            {t("landing.recentOrderRows", []).slice(0, 1).map(([order, status]) => (
              <div key={order} className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm shadow-slate-900/3">
                <span className="khmer-text min-w-0 truncate">{order}</span>
                <span className="khmer-text shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">{status}</span>
              </div>
            ))}
          </div>
          <HeroStatusCard />
        </div>
      </div>
    </div>
  );
}

function HeroFlowRail() {
  const { t } = useLanguage();

  return (
    <div className="mt-3 hidden grid-cols-5 gap-1.5 rounded-3xl border border-slate-200/60 bg-slate-50/55 p-2 sm:grid" aria-hidden="true">
      {t("landing.heroFlowSteps", []).map((item, index) => (
        <div key={item} className={`rounded-2xl px-2 py-2 text-center ${index === 0 ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}>
          <p className="khmer-text truncate text-[10px] font-black">{item}</p>
        </div>
      ))}
    </div>
  );
}

function HeroStatusCard() {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/85 p-3">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="khmer-heading text-sm font-black text-slate-950">{t("landing.heroStatusTitle")}</p>
      </div>
      <div className="mt-2 grid gap-1.5">
        {t("landing.heroStatusRows", []).map(([label, status]) => (
          <div key={label} className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
            <span className="khmer-text truncate">{label}</span>
            <span className="khmer-text shrink-0 text-slate-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowDots() {
  const { t } = useLanguage();

  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-50/65 px-2.5 py-1.5 sm:flex" aria-label={t("landing.heroFlowLabel")}>
      {[QrCode, ShoppingCart, ChefHat, CreditCard, LayoutDashboard].map((Icon, index) => (
        <span key={index} className={`grid h-6 w-6 place-items-center rounded-full ${index === 0 ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

function HeroTableStatusBadge() {
  const { t } = useLanguage();

  return (
    <div className="absolute bottom-5 left-3 z-20 max-w-62 rounded-3xl border border-slate-200/70 bg-white/92 p-2.5 shadow-sm shadow-slate-900/6 backdrop-blur sm:bottom-9 sm:left-10 lg:left-16">
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <span className="grid h-12 w-12 shrink-0 grid-cols-3 gap-0.5 rounded-2xl bg-slate-950 p-2" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className={`rounded-xs ${[0, 2, 4, 6, 8].includes(index) ? "bg-white" : "bg-blue-300"}`} />
          ))}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="khmer-heading text-xs font-black text-slate-950">{t("landing.heroTableBadgeTitle")}</p>
            <span className="khmer-text rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">{t("landing.tableBadge")}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="khmer-text truncate">{t("landing.heroStatusChip")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup({ compact = false }) {
  const { t } = useLanguage();
  const products = t("landing.products", []);
  const visibleProducts = compact ? products.slice(0, 2) : products;
  const categories = t("landing.categories", []);

  return (
    <div className={`rounded-[2.6rem] border border-slate-800 bg-slate-950 shadow-md shadow-slate-950/10 ${compact ? "p-1.5 sm:p-2" : "p-2.5 sm:rounded-[3rem] sm:p-3"}`}>
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50">
        <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" aria-hidden="true" />
        <div className={`bg-[linear-gradient(145deg,#020617_0%,#0E2A4F_58%,#1D4ED8_100%)] text-white ${compact ? "px-3 pb-3 pt-10 sm:px-4 sm:pb-4 sm:pt-11" : "px-5 pb-5 pt-12"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="khmer-text text-xs font-bold text-blue-200">{t("landing.phoneRestaurant")}</p>
              <p className={`khmer-heading mt-1 font-black ${compact ? "text-base sm:text-lg" : "text-xl"}`}>MenuDIGI</p>
            </div>
            <span className="khmer-text inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-black">
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              {t("landing.tableBadge")}
            </span>
          </div>
          <div className={`${compact ? "mt-3" : "mt-5"} flex gap-2 overflow-hidden`}>
            {categories.map((item, index) => (
              <span key={item} className={`khmer-text shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${index === 0 ? "bg-white text-slate-950" : "bg-white/15 text-white"}`}>{item}</span>
            ))}
          </div>
        </div>
        <div className={`grid ${compact ? "gap-2 p-2.5 sm:gap-2.5 sm:p-3" : "gap-3 p-4"}`}>
          {visibleProducts.map((item, index) => (
            <div key={item} className={`grid border border-slate-100 bg-white shadow-sm shadow-slate-900/4 ${compact ? "grid-cols-[48px_1fr] gap-2 rounded-2xl p-2.5 sm:grid-cols-[58px_1fr] sm:gap-3 sm:rounded-3xl sm:p-3" : "grid-cols-[58px_1fr] gap-3 rounded-3xl p-3"}`}>
              <FoodSwatch index={index} compact={compact} />
              <div className="min-w-0">
                <p className="khmer-heading truncate text-sm font-black text-slate-950">{item}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{index === 0 ? "$3.50" : index === 1 ? "$6.00" : "$3.00"}</p>
                <div className="mt-2 h-2 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
          <PhoneJourneyBar compact={compact} />
          <div className={`rounded-3xl bg-blue-600 text-white shadow-md shadow-blue-600/15 ${compact ? "p-3 sm:p-4" : "p-4"}`}>
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span className="khmer-text">{t("landing.cartSummary")}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          {!compact ? <PhonePaymentPreview /> : null}
          <div className={`${compact ? "hidden sm:grid" : "grid"} gap-2 rounded-3xl border border-slate-200 bg-white p-3`}>
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

function PhoneJourneyBar({ compact = false }) {
  const { t } = useLanguage();
  const steps = t("landing.phoneJourney", []);
  const visibleSteps = compact ? steps.slice(0, 4) : steps;

  return (
    <div className={`grid gap-1.5 ${compact ? "grid-cols-4" : "grid-cols-5"}`} aria-hidden="true">
      {visibleSteps.map((item, index) => (
        <div key={item} className={`rounded-2xl px-2 py-2 text-center ${index < 3 ? "bg-blue-50 text-blue-700" : "bg-white text-slate-500"}`}>
          <p className="khmer-text truncate text-[10px] font-black">{item}</p>
        </div>
      ))}
    </div>
  );
}

function PhonePaymentPreview() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-3">
        <p className="khmer-label text-[11px] font-black text-slate-500">{t("landing.paymentBadge")}</p>
        <div className="mt-2 rounded-2xl bg-slate-50 p-2">
          <div className="h-2 w-16 rounded-full bg-slate-200" />
          <div className="mt-2 h-2 w-10 rounded-full bg-blue-200" />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-3">
        <p className="khmer-label text-[11px] font-black text-slate-500">{t("landing.statusPreviewLabel")}</p>
        <div className="mt-3 flex items-center gap-1.5">
          {[0, 1, 2].map((item) => (
            <span key={item} className={`h-2 flex-1 rounded-full ${item < 2 ? "bg-blue-600" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodSwatch({ index, compact = false }) {
  const colors = [
    "from-amber-200 via-orange-100 to-blue-50",
    "from-rose-100 via-amber-100 to-slate-50",
    "from-emerald-100 via-lime-100 to-blue-50",
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${compact ? "h-14 sm:h-16" : "h-16"} ${colors[index % colors.length]}`}>
      <div className="absolute left-3 top-3 h-8 w-8 rounded-full bg-white/70" aria-hidden="true" />
      <div className="absolute bottom-2 right-2 h-5 w-9 rounded-full bg-white/60" aria-hidden="true" />
    </div>
  );
}

function RestaurantWorkflowSection() {
  const { t } = useLanguage();
  const icons = [QrCode, ShoppingCart, ChefHat, CreditCard, BarChart3];

  return (
    <Section id="how-it-works" eyebrow={t("nav.howItWorks")} title={t("landing.sections.howTitle")} description={t("landing.sections.howCopy")}>
      <div className="grid gap-3 md:grid-cols-5">
        {t("landing.workflowSteps", []).map(([title, copy], index) => {
          const Icon = icons[index] || Check;
          return (
            <div key={title} className="rounded-3xl border border-slate-200/70 bg-white/78 p-4 shadow-sm shadow-slate-900/3 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="khmer-heading mt-5 text-base font-black text-slate-950 sm:text-lg">{title}</h3>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {features.map(([key, title, copy]) => {
          const Icon = featureIcons[key] || Utensils;
          const featured = ["qrMenuBuilder", "tableQrGenerator", "kitchenDisplay", "paymentProofReview"].includes(key);
          const span = featured ? "md:col-span-2 lg:col-span-3" : "lg:col-span-2";
          return (
            <article key={key} className={`premium-interactive overflow-hidden rounded-[1.75rem] p-5 shadow-sm shadow-slate-900/3 ring-1 ${featured ? "bg-white/90 ring-slate-200/70" : "bg-white/68 ring-slate-200/45"} ${span}`}>
              <div className="flex items-start justify-between gap-4">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${featured ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                {key === "qrMenuBuilder" ? <MiniQrPreview /> : null}
              </div>
              <h3 className={`khmer-heading mt-5 font-black text-slate-950 ${featured ? "text-xl" : "text-lg"}`}>{title}</h3>
              <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              {key === "qrMenuBuilder" ? <MenuBuilderPreview /> : null}
              {key === "tableQrGenerator" ? <TableQrPreview /> : null}
              {key === "kitchenDisplay" ? <KitchenWorkflowPreview /> : null}
              {key === "paymentProofReview" ? <PaymentProofPreview /> : null}
              {key === "customerMobileOrdering" ? <MobileOrderingStrip /> : null}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function MiniQrPreview() {
  return (
    <div className="grid h-16 w-16 grid-cols-3 gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} className={`rounded-sm ${[0, 2, 4, 6, 8].includes(index) ? "bg-slate-900" : "bg-blue-200"}`} />
      ))}
    </div>
  );
}

function MenuBuilderPreview() {
  return (
    <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50/70 p-3 ring-1 ring-slate-200/55" aria-hidden="true">
      <div className="flex gap-2">
        <span className="h-8 flex-1 rounded-2xl bg-white shadow-sm shadow-slate-900/3" />
        <span className="h-8 w-16 rounded-2xl bg-blue-100" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <span className="h-16 rounded-2xl bg-amber-100" />
        <span className="h-16 rounded-2xl bg-emerald-100" />
        <span className="h-16 rounded-2xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <span className="h-9 rounded-2xl bg-white" />
        <span className="h-9 w-20 rounded-2xl bg-slate-900" />
      </div>
    </div>
  );
}

function TableQrPreview() {
  const { t } = useLanguage();

  return (
    <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50/70 p-3 ring-1 ring-slate-200/55 sm:grid-cols-[auto_1fr]" aria-hidden="true">
      <div className="rounded-3xl bg-white p-2 shadow-sm shadow-slate-900/3">
        <MiniQrPreview />
      </div>
      <div className="grid content-center gap-2">
        <span className="khmer-text text-xs font-black text-slate-500">{t("landing.tableBadge")}</span>
        <div className="h-2 w-full rounded-full bg-white" />
        <div className="h-2 w-2/3 rounded-full bg-blue-100" />
        <div className="mt-1 flex gap-1.5">
          {[QrCode, Smartphone, ShoppingCart].map((Icon, index) => (
            <span key={index} className={`grid h-7 w-7 place-items-center rounded-full ${index === 0 ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function KitchenWorkflowPreview() {
  const { t } = useLanguage();
  const rows = t("landing.kitchenStatusRows", []);

  return (
    <div className="mt-5 grid gap-2 rounded-3xl bg-slate-50/70 p-3 ring-1 ring-slate-200/55">
      <div className="grid grid-cols-3 gap-2" aria-hidden="true">
        {t("landing.kitchenLanes", []).map((item, index) => (
          <div key={item} className={`rounded-2xl px-2 py-2 text-center text-[10px] font-black ${index === 1 ? "bg-amber-100 text-amber-800" : "bg-white text-slate-500"}`}>{item}</div>
        ))}
      </div>
      {rows.slice(0, 3).map(([item, status]) => (
        <div key={item} className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 py-2">
          <span className="khmer-text text-sm font-bold text-slate-700">{item}</span>
          <span className="khmer-text rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{status}</span>
        </div>
      ))}
    </div>
  );
}

function PaymentProofPreview() {
  const { t } = useLanguage();

  return (
    <div className="mt-5 grid gap-2 rounded-3xl bg-slate-50/70 p-3 ring-1 ring-slate-200/55">
      {t("landing.paymentStatusRows", []).map(([item, status], index) => (
        <div key={item} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-white/90 px-3 py-2">
          <div className="min-w-0">
            <span className="khmer-text block truncate text-sm font-bold text-slate-700">{item}</span>
            <span className="mt-1 block h-1.5 w-18 rounded-full bg-slate-100" aria-hidden="true" />
          </div>
          <span className={`khmer-text rounded-full px-2 py-1 text-xs font-bold ${index === 1 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{status}</span>
        </div>
      ))}
    </div>
  );
}

function MobileOrderingStrip() {
  const { t } = useLanguage();
  return (
    <div className="mt-5 flex gap-2 overflow-hidden rounded-3xl bg-slate-50/70 p-3 ring-1 ring-slate-200/55" aria-label={t("landing.customerFlowEyebrow")}>
      {t("landing.phoneJourney", []).slice(0, 4).map((item, index) => (
        <span key={item} className={`khmer-text shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${index === 0 ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{item}</span>
      ))}
    </div>
  );
}

function DashboardPreviewSection() {
  const { t } = useLanguage();

  return (
    <Section id="dashboard-preview" eyebrow={t("landing.dashboardEyebrow")} title={t("landing.sections.dashboardTitle")} description={t("landing.sections.dashboardCopy")}>
      <div className="overflow-hidden rounded-4xl bg-white/88 shadow-sm shadow-slate-900/4 ring-1 ring-slate-200/65">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="khmer-text rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">{t("landing.dashboardTitle")}</span>
        </div>
        <div className="p-3 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {t("landing.dashboardPreviewMetrics", []).map(([label, value, help]) => (
                <div key={label} className="rounded-3xl bg-slate-50/65 p-4 ring-1 ring-slate-200/55">
                  <p className="khmer-label text-xs font-black text-slate-500">{label}</p>
                  <p className="khmer-text mt-3 text-xl font-black text-slate-950">{value}</p>
                  <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-500">{help}</p>
                </div>
              ))}
            </div>
            <DashboardFlowPanel />
            <div className="rounded-3xl bg-slate-50/60 p-4 ring-1 ring-slate-200/55">
              <p className="khmer-heading text-base font-black text-slate-950 sm:text-lg">{t("landing.recentOrderTitle")}</p>
              <div className="mt-3 grid gap-2">
                {t("landing.recentOrderRows", []).map(([order, status]) => (
                  <div key={order} className="flex items-center justify-between gap-3 rounded-2xl bg-white/92 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                    <span className="khmer-text min-w-0 truncate">{order}</span>
                    <span className="khmer-text shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{status}</span>
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
      </div>
    </Section>
  );
}

function DashboardFlowPanel() {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200/55">
      <p className="khmer-heading mb-3 text-sm font-black text-slate-950">{t("landing.dashboardFlowTitle")}</p>
      <div className="grid gap-2 sm:grid-cols-4">
        {t("landing.dashboardFlowRows", []).map(([label, status], index) => (
          <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${index < 2 ? "bg-blue-600" : index === 2 ? "bg-amber-400" : "bg-emerald-500"}`} />
              <p className="khmer-text min-w-0 truncate text-xs font-black text-slate-700">{label}</p>
            </div>
            <p className="khmer-text mt-2 text-xs font-semibold text-slate-500">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ icon, title, rows }) {
  return (
    <div className="rounded-3xl bg-slate-50/70 p-4 ring-1 ring-slate-200/60">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-blue-700 ring-1 ring-slate-200/70">{icon}</div>
        <h3 className="khmer-heading font-black text-slate-950">{title}</h3>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, status]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
            <span className="khmer-text min-w-0 truncate">{label}</span>
            <span className="khmer-text shrink-0 text-xs text-slate-500">{status}</span>
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
      <div className="grid items-center gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="mx-auto w-full max-w-lg rounded-4xl bg-white/88 p-3 shadow-sm shadow-slate-900/4 ring-1 ring-slate-200/65 sm:p-4"><PhoneMockup /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {t("landing.customerFlow", []).map(([title, copy], index) => {
            const Icon = [ScanLine, Smartphone, CustomizeIcon, ReceiptText, UploadCloud, Clock3][index] || Check;
            const important = index === 1 || index === 3 || index === 4;
            return (
              <div key={title} className={`rounded-3xl p-5 shadow-sm shadow-slate-900/3 ring-1 ${important ? "bg-white/90 ring-slate-200/70" : "bg-white/68 ring-slate-200/45"}`}>
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl ${important ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">0{index + 1}</span>
                </div>
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
            <div key={title} className="rounded-3xl bg-white/78 p-5 shadow-sm shadow-slate-900/3 ring-1 ring-slate-200/55">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="khmer-heading mt-4 text-base font-black text-slate-950 sm:text-lg">{title}</h3>
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
            <div key={item} className="flex items-center gap-3 rounded-3xl bg-white/76 p-4 shadow-sm shadow-slate-900/3 ring-1 ring-slate-200/55">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="khmer-heading font-black leading-6 text-slate-950">{item}</p>
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
          <div key={name} className={`flex flex-col rounded-[1.75rem] bg-white/88 p-6 shadow-sm shadow-slate-900/3 ring-1 ${index === 1 ? "ring-2 ring-blue-300" : "ring-slate-200/55"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="khmer-label text-sm font-black text-blue-600">{name}</p>
              {index === 1 ? <span className="khmer-text rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{t("landing.pricingPlanLabel")}</span> : null}
            </div>
            <h3 className="khmer-heading mt-3 text-xl font-black text-slate-950">{t("landing.pricingCardTitle")}</h3>
            <p className="khmer-text mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <ul className="khmer-text mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm font-semibold leading-6 text-slate-700">
              {items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link to="/register" className={`khmer-button mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-black ${index === 1 ? "bg-blue-600 text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700" : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"} lg:mt-auto`}>
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
      <div className="mx-auto grid max-w-5xl gap-3 lg:grid-cols-2">
        {t("landing.faqs", []).map(([question, answer]) => (
          <details key={question} className="group rounded-3xl bg-white/78 p-5 shadow-sm shadow-slate-900/3 ring-1 ring-slate-200/55">
            <summary className="khmer-heading flex cursor-pointer list-none items-center justify-between gap-4 font-black leading-7 text-slate-950">
              <span>{question}</span>
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
    <section className="px-4 py-14 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#020617_0%,#10233F_52%,#1D4ED8_100%)] p-7 text-white shadow-lg shadow-slate-900/12 sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="khmer-heading mt-3 text-3xl font-black leading-tight sm:text-4xl">{t("landing.sections.finalTitle")}</h2>
            <p className="khmer-text mt-4 max-w-2xl text-sm leading-6 text-slate-300">{t("landing.sections.finalCopy")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link to="/register" className="khmer-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm shadow-blue-950/20 hover:bg-blue-700">{t("landing.finalCreate")}</Link>
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
    <motion.section id={id} className="px-4 py-14 sm:py-18 lg:px-8 lg:py-20" {...getMotion(reduced)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl sm:mb-10">
          {eyebrow ? <p className="khmer-label text-xs font-black text-blue-600">{eyebrow}</p> : null}
          <h2 className="khmer-heading mt-3 text-2xl font-black leading-tight tracking-normal text-slate-950 sm:text-3xl lg:text-4xl">{title}</h2>
          {description ? <p className="khmer-text mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
        </div>
        {children}
      </div>
    </motion.section>
  );
}
