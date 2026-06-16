import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu as MenuIcon,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Store,
  Table2,
  X,
  Zap,
} from "lucide-react";
import AppLogo from "../../components/common/AppLogo";

const navItems = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
  ["Demo", "#live-preview"],
  ["FAQ", "#faq"],
];

const featureCards = [
  [QrCode, "QR table menu", "Give every table a scannable menu that customers can browse on their own phone."],
  [ReceiptText, "Online ordering", "Receive dine-in and takeaway orders directly into your operations dashboard."],
  [Store, "Products and categories", "Update items, prices, availability, options, and add-ons without printing new menus."],
  [Table2, "Branches and tables", "Organize restaurants, cafes, marts, tables, QR codes, and service areas."],
  [ChefHat, "Kitchen operations", "Move orders from new to preparing, ready, and completed with a kitchen-friendly screen."],
  [CreditCard, "Payment confirmation", "Support cash, manual proof, KHQR-ready workflows, and payment review from one place."],
  [Zap, "Realtime-ready flow", "Operations screens are prepared for live order, payment, and kitchen updates."],
  [BarChart3, "Reports and analytics", "Track sales, products, payments, daily closing, shifts, and cash operations."],
  [ShieldCheck, "Roles and permissions", "Control access for owners, managers, cashiers, waiters, and admins."],
];

const showcaseTabs = [
  {
    title: "Dashboard",
    copy: "Monitor orders, sales, branch activity, and payment status from a clean owner workspace.",
    bullets: ["Today sales and order queues", "Realtime-ready operations cards", "Reports and health visibility"],
  },
  {
    title: "Products",
    copy: "Manage categories, products, options, add-ons, pricing, and Khmer/English menu text.",
    bullets: ["Fast product updates", "Option and add-on support", "Localization foundation"],
  },
  {
    title: "Kitchen / POS",
    copy: "Give kitchen and staff teams a readable workflow for active orders and payment reviews.",
    bullets: ["Large kitchen cards", "Status actions", "Payment proof review"],
  },
];

const faqs = [
  ["What is MenuDIGI?", "MenuDIGI is a QR menu and restaurant ordering platform for restaurants, cafes, marts, and food businesses."],
  ["Do customers need to install an app?", "No. Customers scan a QR code and open the menu in their mobile browser."],
  ["Can I use QR codes for tables?", "Yes. MenuDIGI includes table and QR workflows for customer menu access."],
  ["Does it support online orders?", "Yes. Customers can add products to cart and submit orders to the restaurant."],
  ["Can staff manage orders?", "Yes. Role-based admin screens support owners, managers, cashiers, waiters, and operations teams."],
  ["Can I accept KHQR or ABA payments?", "MenuDIGI has payment workflow support for cash, manual proof upload, Bakong KHQR-ready flows, and ABA-ready architecture. Production payment setup still depends on merchant configuration."],
  ["Is it mobile friendly?", "Yes. The customer menu and checkout flow are designed mobile-first for QR ordering."],
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.28, ease: "easeOut" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustStatsSection />
        <PaymentSupportSection />
        <FeatureGridSection />
        <PlatformShowcaseSection />
        <HowItWorksSection />
        <LivePreviewSection />
        <PricingSection />
        <DesignedForSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Main navigation">
        <AppLogo to="/" size="md" ariaLabel="Go to MenuDIGI home" />
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-bold text-slate-600 transition hover:text-slate-950">{label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">Sign in</Link>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700">
            Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>{label}</a>
            ))}
            <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">
              <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign in</Link>
              <Link to="/register" className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-black text-white hover:bg-blue-700">Get started</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-100 via-sky-50 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-24">
        <motion.div {...fadeUp} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 shadow-sm">
            Built for Cambodian restaurant operations
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Digital menus, orders, and payments for modern restaurants.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            MenuDIGI helps restaurants create QR menus, generate table codes, receive customer orders, manage kitchen workflows, and confirm payments from one focused dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700">
              Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#live-preview" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50">
              View Demo
            </a>
            <Link to="/login" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white">
              Sign In
            </Link>
          </div>
          <div className="mt-7 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            {["Fast setup", "QR menu ready", "Mobile-first ordering", "KHQR-ready workflow", "ABA-ready architecture", "Role-based staff access"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />{item}</span>
            ))}
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }} className="relative">
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative min-h-[560px]">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 top-0 hidden w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Operations</p>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Live</span>
        </div>
        <div className="mt-4 grid gap-3">
          <MockRow label="New order received" value="Table 08" tone="blue" />
          <MockRow label="Payment pending" value="KHR 42,000" tone="amber" />
          <MockRow label="Kitchen preparing" value="4 items" tone="emerald" />
        </div>
      </motion.div>
      <div className="absolute left-0 top-10 w-[290px] rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl sm:left-10">
        <PhoneMenuMockup />
      </div>
      <div className="absolute bottom-0 right-0 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
        <DashboardMockup />
      </div>
      <div className="absolute left-6 top-5 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-lg">
        QR table scan
      </div>
    </div>
  );
}

function PhoneMenuMockup() {
  return (
    <div className="rounded-[1.6rem] bg-slate-50 p-3">
      <div className="rounded-3xl bg-slate-950 p-4 text-white">
        <p className="text-xs font-bold text-blue-200">MenuDIGI Cafe</p>
        <h3 className="mt-2 text-xl font-black">Coffee menu</h3>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {["Coffee", "Food", "Tea"].map((item, index) => (
            <span key={item} className={`rounded-full px-3 py-1 text-xs font-black ${index === 0 ? "bg-white text-slate-950" : "bg-white/15 text-white"}`}>{item}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        {["Iced Latte", "Beef Lok Lak", "Passion Soda"].map((item, index) => (
          <div key={item} className="grid grid-cols-[56px_1fr] gap-3 rounded-2xl bg-white p-2 shadow-sm">
            <div className={`h-14 rounded-xl ${index === 0 ? "bg-blue-100" : index === 1 ? "bg-amber-100" : "bg-emerald-100"}`} />
            <div>
              <p className="text-sm font-black text-slate-950">{item}</p>
              <p className="mt-1 text-xs text-slate-500">KHR {(index + 1) * 8000}</p>
              <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-blue-600 p-3 text-center text-sm font-black text-white">View cart - KHR 24,000</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">Dashboard</p>
          <h3 className="text-xl font-black text-slate-950">Today operations</h3>
        </div>
        <LayoutDashboard className="h-6 w-6 text-blue-600" aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Orders", "24"],
          ["Pending", "6"],
          ["Sales", "KHR 840K"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustStatsSection() {
  const cards = [
    ["3-step setup", "Create profile, add menu, generate QR."],
    ["Unlimited menu updates", "Change products and pricing anytime."],
    ["Realtime order flow", "Prepared for live order and kitchen updates."],
    ["QR-ready tables", "Built around table ordering workflows."],
  ];

  return (
    <Section id="trust" eyebrow="Product foundations" title="Built for practical restaurant rollout." description="No fake adoption numbers. MenuDIGI focuses on a clear operational foundation restaurants can understand and use.">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([title, copy]) => <InfoCard key={title} title={title} copy={copy} />)}
      </div>
    </Section>
  );
}

function PaymentSupportSection() {
  return (
    <Section id="payments" eyebrow="Cambodia payments" title="Payment-ready for Cambodian restaurants." description="MenuDIGI supports payment workflows without exposing provider secrets or raw internal payloads.">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CreditCard className="h-10 w-10 text-blue-600" aria-hidden="true" />
          <h3 className="mt-4 text-2xl font-black text-slate-950">KHQR and ABA-ready architecture</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Built to support Bakong KHQR, ABA PayWay, cash payments, manual proof upload, and staff payment confirmation workflows.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Bakong KHQR workflow", "ABA PayWay-ready structure", "Cash payment support", "Manual proof upload", "Payment confirmation queue", "Audit-ready review trail"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-800 shadow-sm">
              <Check className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />{item}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeatureGridSection() {
  return (
    <Section id="features" eyebrow="Features" title="A complete operating layer for digital menus." description="From the customer scan to the kitchen screen, MenuDIGI keeps the workflow connected.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map(([Icon, title, copy], index) => (
          <motion.div
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.22, ease: "easeOut", delay: Math.min(index * 0.03, 0.18) }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function PlatformShowcaseSection() {
  return (
    <Section id="platform" eyebrow="Platform" title="One system for menu, service, and operations." description="A clean admin workspace and mobile-first customer experience work together.">
      <div className="grid gap-4 lg:grid-cols-3">
        {showcaseTabs.map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
            <ul className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
              {item.bullets.map((bullet) => <li key={bullet} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />{bullet}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  const steps = [
    ["01", "Create your restaurant profile", "Set up shop details, branches, and operating information."],
    ["02", "Add categories and products", "Build a menu with prices, images, options, and availability."],
    ["03", "Generate table QR codes", "Let customers scan and order from their phone."],
    ["04", "Receive and manage orders", "Move orders through payment, kitchen, and completion workflows."],
  ];

  return (
    <Section id="how-it-works" eyebrow="How it works" title="Launch the flow in four steps." description="MenuDIGI is designed for restaurant teams that need a simple rollout path.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map(([number, title, copy]) => (
          <div key={number} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-black text-blue-600">{number}</div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function LivePreviewSection() {
  return (
    <Section id="live-preview" eyebrow="Live preview" title="See the customer flow before setup." description="A premium phone-style preview of how customers browse, order, and check out.">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl">
          <PhoneMenuMockup />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950">Preview customer menu</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The live demo route depends on seed data. For a real tenant preview, create an account, add a shop, then open the public menu link generated for that shop.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Create account</Link>
            <a href="#hero" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">Back to top</a>
          </div>
        </div>
      </div>
    </Section>
  );
}

function PricingSection() {
  // TODO: Finalize pricing, limits, and terms before production sales launch.
  const plans = [
    ["Free", "Start digitizing a small menu.", ["Basic QR menu", "Limited products/categories", "Manual order management"]],
    ["Starter", "For active restaurants and cafes.", ["More products", "Branch/table management", "Order dashboard", "Payment confirmation"]],
    ["Pro", "For multi-branch operations.", ["Unlimited products", "Kitchen operations", "Analytics", "Staff roles", "Realtime features"]],
  ];

  return (
    <Section id="pricing" eyebrow="Pricing" title="Simple plans for the rollout stage." description="Pricing is a planning placeholder and must be finalized before production sales.">
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map(([name, copy, items], index) => (
          <div key={name} className={`rounded-3xl border bg-white p-6 shadow-sm ${index === 1 ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"}`}>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">{name}</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">{index === 0 ? "Free" : "Contact sales"}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <ul className="mt-6 grid gap-3 text-sm font-bold text-slate-700">
              {items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link to="/register" className={`mt-6 inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-black ${index === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 text-slate-800 hover:bg-slate-50"}`}>
              Start with {name}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DesignedForSection() {
  return (
    <Section id="designed-for" eyebrow="Designed for" title="Made for different food business formats." description="No fake testimonials. These cards show the business types the product is designed to support.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Cafes", "Restaurants", "Food courts", "Marts and small shops"].map((item) => <InfoCard key={item} title={item} copy="Mobile menus, quick ordering, and staff-ready operations." />)}
      </div>
    </Section>
  );
}

function FAQSection() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Answers before you digitize." description="Practical answers based on the current MenuDIGI product.">
      <div className="grid gap-3">
        {faqs.map(([question, answer]) => (
          <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-300">Ready to digitize your restaurant?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Launch a smarter ordering experience with MenuDIGI.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Create QR menus, manage orders, review payments, and support staff operations from one modern platform.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700">Create your MenuDIGI account</Link>
            <Link to="/login" className="rounded-2xl border border-white/20 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <AppLogo to="/" size="sm" ariaLabel="Go to MenuDIGI home" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">QR menus, ordering, kitchen operations, and payment workflows for restaurants in Cambodia.</p>
        </div>
        <FooterGroup title="Product" links={[["Features", "#features"], ["Pricing", "#pricing"], ["Demo", "#live-preview"]]} />
        <FooterGroup title="Company" links={[["Sign in", "/login"], ["Get started", "/register"], ["FAQ", "#faq"]]} />
        <FooterGroup title="Legal" links={[["Privacy placeholder", "#"], ["Terms placeholder", "#"]]} />
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs font-semibold text-slate-500">© {new Date().getFullYear()} MenuDIGI. Built for restaurants in Cambodia.</p>
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
  return (
    <motion.section id={id} className="px-4 py-14 lg:px-8 lg:py-18" {...fadeUp}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
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

function MockRow({ label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs font-black ${tones[tone]}`}>{value}</span>
    </div>
  );
}
