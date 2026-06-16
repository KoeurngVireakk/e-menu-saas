import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  ChevronDown,
  CreditCard,
  Languages,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Store,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import useLanguage from "../../i18n/useLanguage";

const navItems = [
  ["nav.features", "#features"],
  ["nav.howItWorks", "#how-it-works"],
  ["nav.pricing", "#pricing"],
  ["nav.demo", "#demo"],
  ["nav.faq", "#faq"],
];

const featureIcons = [QrCode, ReceiptText, Store, Package, ChefHat, CreditCard, Zap, BarChart3, ShieldCheck];

function getMotion(reduced, delay = 0) {
  if (reduced) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.32, ease: "easeOut", delay },
  };
}

export default function LandingPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950" lang={language}>
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustStatsSection />
        <FeatureGridSection />
        <HowItWorksSection />
        <PaymentReadySection />
        <PricingSection />
        <DemoSection />
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
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Main navigation">
        <AppLogo to="/" size="md" ariaLabel="Go to MenuDIGI home" />
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="text-sm font-black text-slate-600 transition hover:text-blue-700">{t(labelKey)}</a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link to="/login" className="rounded-2xl px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100">{t("common.signIn")}</Link>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700">
            {t("common.getStarted")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="rounded-2xl p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
      >
        <div className="grid gap-2 px-4 py-4">
          <LanguageToggle className="mb-2 w-fit" />
          {navItems.map(([labelKey, href]) => (
            <a key={href} href={href} className="rounded-2xl px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={close}>{t(labelKey)}</a>
          ))}
          <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">
            <Link to="/login" className="rounded-2xl px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">{t("common.signIn")}</Link>
            <Link to="/register" className="rounded-2xl bg-blue-600 px-3 py-2 text-center text-sm font-black text-white hover:bg-blue-700">{t("landing.getStartedFree")}</Link>
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_85%_35%,rgba(14,165,233,0.18),transparent_28%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
        <motion.div {...getMotion(reduced)} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase text-blue-700 shadow-sm">
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t("landing.badge")}
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t("landing.headline")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t("landing.subheadline")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
              {t("landing.getStartedFree")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#demo" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
              {t("landing.viewDemo")}
            </a>
            <Link to="/login" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white">
              {t("landing.signIn")}
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            {t("landing.trustPoints", []).map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />{item}</span>
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
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <div className="relative min-h-[680px] lg:min-h-[740px]">
      <div className="absolute left-1/2 top-12 h-96 w-80 -translate-x-1/2 rounded-full bg-blue-300/30 blur-3xl" aria-hidden="true" />
      <motion.div {...floatMotion} className="absolute left-1/2 top-0 z-20 w-[315px] -translate-x-1/2 sm:w-[360px]" aria-label="MenuDIGI mobile ordering preview">
        <PhoneMockup />
      </motion.div>
      <motion.div {...getMotion(reduced, 0.1)} className="absolute bottom-0 right-0 z-10 w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur">
        <DashboardMockup />
      </motion.div>
      <motion.div {...getMotion(reduced, 0.18)} className="absolute left-0 top-24 hidden rounded-3xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-xl sm:block">
        {t("landing.realtimeBadge")}
      </motion.div>
    </div>
  );
}

function PhoneMockup() {
  const { t } = useLanguage();
  const products = t("landing.products", []);
  const categories = t("landing.categories", []);

  return (
    <div className="rounded-[3.2rem] border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-slate-950/30">
      <div className="relative overflow-hidden rounded-[2.7rem] bg-slate-50">
        <div className="absolute left-1/2 top-3 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950 shadow-lg" aria-hidden="true" />
        <div className="bg-slate-950 px-5 pb-5 pt-14 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-blue-200">{t("landing.phoneRestaurant")}</p>
              <h2 className="mt-1 text-2xl font-black">MenuDIGI</h2>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{t("landing.tableBadge")}</span>
          </div>
          <div className="mt-5 flex gap-2 overflow-hidden">
            {categories.map((item, index) => (
              <span key={item} className={`rounded-full px-3 py-1.5 text-xs font-black ${index === 0 ? "bg-white text-slate-950" : "bg-white/15 text-white"}`}>{item}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-4">
          {products.map((item, index) => (
            <div key={item} className="grid grid-cols-[64px_1fr] gap-3 rounded-3xl bg-white p-3 shadow-sm">
              <div className={`h-16 rounded-2xl ${index === 0 ? "bg-blue-100" : index === 1 ? "bg-amber-100" : "bg-emerald-100"}`} />
              <div>
                <p className="text-sm font-black text-slate-950">{item}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{index === 0 ? "$3.50" : index === 1 ? "$6.00" : "$3.00"}</p>
                <div className="mt-2 h-2 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/20">
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span>{t("landing.cartSummary")}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-black uppercase text-slate-500">{t("common.orderStatus")}</p>
            <p className="text-sm font-black text-slate-950">{t("landing.statusPreview")}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">{t("landing.paymentBadge")}</span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700">{t("landing.realtimeBadge")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  const { t } = useLanguage();
  const metrics = [
    [t("landing.todayOrders"), "42"],
    [t("landing.sales"), "$684"],
    [t("landing.pendingPayments"), "8"],
    [t("landing.kitchenQueue"), "12"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-blue-600">{t("landing.dashboardTitle")}</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">MenuDIGI OS</h3>
        </div>
        <LayoutDashboard className="h-7 w-7 text-blue-600" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-28 items-end gap-2">
            {[42, 60, 48, 78, 66, 92, 76].map((height, index) => (
              <div key={height + index} className="flex-1 rounded-t-xl bg-blue-500/80" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-xs font-black uppercase text-slate-500">{t("landing.recentOrders")}</p>
          {["A01", "B04", "C02"].map((table, index) => (
            <div key={table} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
              <span>#{1000 + index} · {table}</span>
              <span className="text-blue-700">{index === 0 ? "New" : index === 1 ? "Paid" : "Ready"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustStatsSection() {
  const { t } = useLanguage();
  return (
    <Section eyebrow="MenuDIGI" title={t("landing.sections.statsTitle")} description={t("landing.sections.statsCopy")}>
      <div className="grid gap-4 md:grid-cols-4">
        {t("landing.stats", []).map(([title, copy]) => <InfoCard key={title} title={title} copy={copy} />)}
      </div>
    </Section>
  );
}

function FeatureGridSection() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  return (
    <Section id="features" eyebrow={t("nav.features")} title={t("landing.sections.featuresTitle")} description={t("landing.sections.featuresCopy")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {t("landing.features", []).map(([title, copy], index) => {
          const Icon = featureIcons[index] || Utensils;
          return (
            <motion.div
              key={title}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
              {...getMotion(reduced, Math.min(index * 0.035, 0.2))}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-600/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  const { t } = useLanguage();
  return (
    <Section id="how-it-works" eyebrow={t("nav.howItWorks")} title={t("landing.sections.howTitle")} description={t("landing.sections.howCopy")}>
      <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {t("landing.steps", []).map(([number, title, copy]) => (
          <div key={number} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{number}</div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PaymentReadySection() {
  const { t } = useLanguage();
  return (
    <Section eyebrow={t("common.payment")} title={t("landing.sections.paymentTitle")} description={t("landing.sections.paymentCopy")}>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-600/20">
          <CreditCard className="h-10 w-10" aria-hidden="true" />
          <h3 className="mt-5 text-2xl font-black">KHQR / ABA</h3>
          <p className="mt-3 text-sm leading-6 text-blue-50">{t("landing.sections.paymentCopy")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {t("landing.payments", []).map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-black text-slate-800 shadow-sm">
              <Check className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />{item}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function PricingSection() {
  const { t } = useLanguage();
  // TODO: Pricing must be finalized before production.
  return (
    <Section id="pricing" eyebrow={t("nav.pricing")} title={t("landing.sections.pricingTitle")} description={t("landing.sections.pricingCopy")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {t("landing.pricingPlans", []).map(([name, copy, items], index) => (
          <motion.div key={name} whileHover={{ y: -4 }} transition={{ duration: 0.18 }} className={`rounded-[2rem] border bg-white p-6 shadow-sm ${index === 1 ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"}`}>
            <p className="text-sm font-black uppercase text-blue-600">{name}</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">{index === 0 ? "Free" : "Contact sales"}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <ul className="mt-6 grid gap-3 text-sm font-bold text-slate-700">
              {items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link to="/register" className={`mt-6 inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-black ${index === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 text-slate-800 hover:bg-slate-50"}`}>
              {t("landing.finalCreate")}
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function DemoSection() {
  const { t } = useLanguage();
  return (
    <Section id="demo" eyebrow={t("nav.demo")} title={t("landing.phoneRestaurant")} description={t("landing.subheadline")}>
      <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="mx-auto w-full max-w-sm"><PhoneMockup /></div>
        <DashboardMockup />
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
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-slate-950">
              {question}
              <ChevronDown className="h-5 w-5 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
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
            <p className="text-sm font-black uppercase text-blue-300">MenuDIGI</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{t("landing.sections.finalTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{t("landing.sections.finalCopy")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700">{t("landing.finalCreate")}</Link>
            <a href="#demo" className="rounded-2xl border border-white/20 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10">{t("landing.viewDemo")}</a>
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
          <AppLogo to="/" size="sm" ariaLabel="Go to MenuDIGI home" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">{t("landing.footerCopy")}</p>
          <LanguageToggle className="mt-4" />
        </div>
        <FooterGroup title="Product" links={[[t("nav.features"), "#features"], [t("nav.pricing"), "#pricing"], [t("nav.demo"), "#demo"]]} />
        <FooterGroup title="Support" links={[[t("common.signIn"), "/login"], [t("common.getStarted"), "/register"], [t("nav.faq"), "#faq"]]} />
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs font-semibold text-slate-500">© {new Date().getFullYear()} MenuDIGI.</p>
    </footer>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <p className="font-black text-slate-950">{title}</p>
      <div className="mt-3 grid gap-2">
        {links.map(([label, href]) => href.startsWith("/") ? (
          <Link key={label} to={href} className="text-sm font-semibold text-slate-500 hover:text-slate-950">{label}</Link>
        ) : (
          <a key={label} href={href} className="text-sm font-semibold text-slate-500 hover:text-slate-950">{label}</a>
        ))}
      </div>
    </div>
  );
}

function Section({ id, eyebrow, title, description, children }) {
  const reduced = useReducedMotion();
  return (
    <motion.section id={id} className="px-4 py-14 lg:px-8 lg:py-18" {...getMotion(reduced)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? <p className="text-xs font-black uppercase text-blue-600">{eyebrow}</p> : null}
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{title}</h2>
          {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
        </div>
        {children}
      </div>
    </motion.section>
  );
}

function InfoCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  );
}
