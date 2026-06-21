import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Bell, CheckCheck, ChevronDown, HeartPulse, LayoutDashboard, LogOut, Menu, Package, Search, Settings2, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import RealtimeStatusBadge from "../realtime/RealtimeStatusBadge";
import { confirmAction } from "../ui";
import { useAuth } from "../../context/AuthContext";
import useLanguage from "../../i18n/useLanguage";
import LanguageToggle from "../common/LanguageToggle";
import { canView } from "../../utils/permissions";

const pageContext = [
  ["/admin/products", "pageTitles.productsTitle", "navbar.catalogWork", "pageTitles.productsSubtitle"],
  ["/admin/categories", "pageTitles.categoriesTitle", "navbar.catalogWork", "pageTitles.categoriesSubtitle"],
  ["/admin/branches", "pageTitles.branchesTitle", "navbar.workspaceSetup", "pageTitles.branchesSubtitle"],
  ["/admin/tables", "pageTitles.tablesTitle", "navbar.workspaceSetup", "pageTitles.tablesSubtitle"],
  ["/admin/orders", "pageTitles.ordersTitle", "navbar.liveOperations", "pageTitles.ordersSubtitle"],
  ["/admin/kitchen", "pageTitles.kitchenTitle", "navbar.liveOperations", "pageTitles.kitchenSubtitle"],
  ["/admin/payments", "pageTitles.paymentsTitle", "navbar.liveOperations", "pageTitles.paymentsSubtitle"],
  ["/admin/shops", "pageTitles.shopsTitle", "navbar.workspaceSetup", "pageTitles.shopsSubtitle"],
  ["/admin/print-stations", "pageTitles.printStationsTitle", "navbar.liveOperations", "pageTitles.printStationsSubtitle"],
  ["/admin/translations", "pageTitles.translationsTitle", "navbar.catalogWork", "pageTitles.translationsSubtitle"],
  ["/admin/shifts", "pageTitles.shiftsTitle", "navbar.businessReview", "pageTitles.shiftsSubtitle"],
  ["/admin/daily-closing", "pageTitles.dailyClosingTitle", "navbar.businessReview", "pageTitles.dailyClosingSubtitle"],
  ["/admin/invoices", "pageTitles.invoicesTitle", "navbar.businessReview", "pageTitles.invoicesSubtitle"],
  ["/admin/expenses", "pageTitles.expensesTitle", "navbar.businessReview", "pageTitles.expensesSubtitle"],
  ["/admin/cash-ledger", "pageTitles.cashLedgerTitle", "navbar.businessReview", "pageTitles.cashLedgerSubtitle"],
  ["/admin/settings", "pageTitles.settingsTitle", "navbar.workspaceSetup", "pageTitles.settingsSubtitle"],
  ["/admin/account/profile", "account.profileTitle", "navbar.workspaceSetup", "account.profileSubtitle"],
  ["/admin/notifications", "notifications.title", "navbar.liveOperations", "notifications.subtitle"],
  ["/admin/staff", "pageTitles.staffTitle", "navbar.workspaceSetup", "pageTitles.staffSubtitle"],
  ["/admin/reports", "pageTitles.reportsTitle", "navbar.businessReview", "pageTitles.reportsSubtitle"],
  ["/admin/system-health", "pageTitles.systemHealthTitle", "navbar.workspaceSetup", "pageTitles.systemHealthSubtitle"],
  ["/admin", "pageTitles.dashboardTitle", "navbar.controlTower", "pageTitles.dashboardSubtitle"],
];

function getPageContext(pathname) {
  return pageContext.find(([path]) => pathname === path || (path !== "/admin" && pathname.startsWith(path))) || pageContext.at(-1);
}

const workflowIcons = {
  "navbar.controlTower": LayoutDashboard,
  "navbar.liveOperations": Activity,
  "navbar.catalogWork": Package,
  "navbar.workspaceSetup": Settings2,
  "navbar.businessReview": Activity,
};

export default function Navbar({ onOpenCommand, onToggleNavigation }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [, titleKey, eyebrowKey] = getPageContext(pathname);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const displayName = user?.name || user?.email || t("navbar.accountFallback", "Account");
  const profilePhoto = user?.avatar_url || user?.profile_photo_url || user?.photo_url || user?.image_url;
  const initials = getInitials(displayName);
  const RouteIcon = workflowIcons[eyebrowKey] || LayoutDashboard;
  const hasToken = Boolean(localStorage.getItem("emenu_token"));

  const loadUnreadCount = useCallback(() => {
    if (!hasToken) return Promise.resolve();

    return api
      .get("/notifications/unread-count")
      .then((response) => setUnreadCount(Number(response.data.data.count || 0)))
      .catch(() => setUnreadCount(0));
  }, [hasToken]);

  const loadNotificationItems = useCallback(() => {
    if (!hasToken) return Promise.resolve();

    setNotificationsLoading(true);
    return api
      .get("/notifications", { params: { per_page: 5 } })
      .then((response) => setNotificationItems(response.data.data.notifications || []))
      .catch(() => setNotificationItems([]))
      .finally(() => setNotificationsLoading(false));
  }, [hasToken]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const confirmLogout = async () => {
    if (await confirmAction(t("auth.logoutTitle"), t("auth.logoutDescription"))) {
      setProfileOpen(false);
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 min-w-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:max-w-xs">
        <button type="button" aria-label={t("navbar.openNavigation")} aria-controls="admin-navigation" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden" onClick={onToggleNavigation}>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 sm:grid">
          <RouteIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="khmer-label truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">{t(eyebrowKey)}</p>
          <p className="khmer-heading truncate text-sm font-black text-slate-950 sm:text-base">{t(titleKey)}</p>
        </div>
      </div>
      <button
        type="button"
        className="mx-4 hidden h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-left text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex"
        aria-label={t("navbar.searchPlaceholder")}
        onClick={onOpenCommand}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-semibold">{t("navbar.searchPlaceholder")}</span>
        <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Ctrl K</kbd>
      </button>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <RealtimeStatusBadge status="unavailable" compact className="hidden lg:inline-flex" />
        <button
          type="button"
          aria-label={t("navbar.searchPlaceholder")}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={onOpenCommand}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="relative hidden sm:block" ref={notificationsRef}>
          <button
            type="button"
            aria-label={t("navbar.notificationsTitle", "Notifications")}
            aria-expanded={notificationsOpen}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => {
              setNotificationsOpen((value) => {
                const next = !value;
                if (next) loadNotificationItems();
                return next;
              });
              setProfileOpen(false);
            }}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>
          {notificationsOpen ? (
            <NotificationPanel
              t={t}
              items={notificationItems}
              unreadCount={unreadCount}
              loading={notificationsLoading}
              onClose={() => setNotificationsOpen(false)}
              onMarkedRead={() => {
                loadUnreadCount();
                loadNotificationItems();
              }}
            />
          ) : null}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label={t("navbar.accountMenu", "Account menu")}
            aria-expanded={profileOpen}
            aria-haspopup="dialog"
            aria-controls="account-menu"
            className={`inline-flex h-10 min-w-0 items-center gap-2 rounded-xl border px-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-2 ${profileOpen ? "border-slate-300 bg-slate-100" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"}`}
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
          >
            <ProfileAvatar src={profilePhoto} name={displayName} initials={initials} t={t} />
            <span className="hidden min-w-0 xl:block">
              <span className="block max-w-28 truncate text-sm font-bold text-slate-950">{displayName}</span>
            </span>
            <ChevronDown className={`hidden h-3.5 w-3.5 text-slate-400 transition xl:block ${profileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {profileOpen ? (
            <div id="account-menu" role="dialog" aria-label={t("navbar.accountMenu", "Account menu")} className="absolute right-0 top-11 z-30 w-[min(21rem,calc(100vw-1rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
              <div className="border-b border-slate-100 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <ProfileAvatar src={profilePhoto} name={displayName} initials={initials} size="lg" t={t} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{user?.email || t("navbar.signedIn", "Signed in")}</p>
                    <p className="khmer-label mt-1 text-[10px] font-bold uppercase text-slate-400">{user?.role || t("common.adminWorkspace")}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 px-4 py-3.5">
                <div>
                  <p className="khmer-label mb-1.5 text-[11px] font-bold uppercase text-slate-500">{t("common.language")}</p>
                  <LanguageToggle compact className="w-full" />
                </div>
                <nav className="grid gap-1 border-t border-slate-100 pt-2" aria-label="Account links">
                  <Link to="/admin/account/profile" className="khmer-button flex min-h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setProfileOpen(false)}><UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />{t("account.profileTitle", "Profile")}</Link>
                  {canView(user, "settings") ? <Link to="/admin/settings" className="khmer-button flex min-h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setProfileOpen(false)}><Settings2 className="h-4 w-4 text-slate-400" aria-hidden="true" />{t("pageTitles.settingsTitle")}</Link> : null}
                  {canView(user, "systemHealth") ? <Link to="/admin/system-health" className="khmer-button flex min-h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setProfileOpen(false)}><HeartPulse className="h-4 w-4 text-slate-400" aria-hidden="true" />{t("pageTitles.systemHealthTitle")}</Link> : null}
                  <Link to="/admin/notifications" className="khmer-button flex min-h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setProfileOpen(false)}><Bell className="h-4 w-4 text-slate-400" aria-hidden="true" />{t("notifications.title", "Notifications")}</Link>
                </nav>
                <button
                  type="button"
                  className="khmer-button inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  onClick={confirmLogout}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t("common.logout")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function NotificationPanel({ t, items, unreadCount, loading, onClose, onMarkedRead }) {
  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      onMarkedRead();
    } catch {
      // Keep navbar compact; full error handling is available on the notifications page.
    }
  };

  return (
    <div className="absolute right-0 top-12 z-30 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="khmer-heading text-sm font-black text-slate-950">{t("navbar.notificationsTitle", "Notifications")}</p>
          <p className="khmer-text text-xs font-semibold text-slate-500">{t("navbar.notificationsSubtitle", "Latest operational activity.")}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500">{unreadCount}</span>
      </div>
      <div className="grid gap-3 p-4">
        {loading ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{t("notifications.loading", "Loading notifications...")}</p> : null}
        {!loading && !items.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <Bell className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
            <p className="khmer-heading mt-2 text-sm font-black text-slate-950">{t("navbar.notificationsEmpty", "No notifications yet")}</p>
            <p className="khmer-text mt-1 text-xs leading-5 text-slate-500">{t("navbar.notificationsEmptyDescription", "Real order, payment, and system notification logs will appear here after they are generated.")}</p>
          </div>
        ) : null}
        {!loading && items.length ? (
          <div className="grid gap-2">
            {items.map((item) => (
              <Link key={item.id} to="/admin/notifications" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <div className="flex items-start gap-2">
                  {!item.read_at ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /> : <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-200" />}
                  <div className="min-w-0">
                    <p className="khmer-heading truncate text-sm font-black text-slate-950">{item.title}</p>
                    <p className="khmer-text mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
        {unreadCount > 0 ? (
          <button type="button" className="khmer-button inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {t("notifications.markAllAsRead", "Mark all as read")}
          </button>
        ) : null}
        <Link
          to="/admin/notifications"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {t("notifications.viewAll", "View all notifications")}
        </Link>
      </div>
    </div>
  );
}

function ProfileAvatar({ src, name, initials, size = "md", t }) {
  const sizeClass = size === "lg" ? "h-11 w-11" : "h-9 w-9";

  if (src) {
    return <img src={src} alt={t("navbar.profilePhotoAlt", "{{name}} profile photo").replace("{{name}}", name)} className={`${sizeClass} rounded-2xl object-cover ring-1 ring-slate-200`} />;
  }

  return (
    <span className={`${sizeClass} grid shrink-0 place-items-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-600/20`}>
      {initials}
    </span>
  );
}

function getInitials(name) {
  return String(name || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "A";
}
