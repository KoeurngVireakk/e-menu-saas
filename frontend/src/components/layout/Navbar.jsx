import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import RealtimeStatusBadge from "../realtime/RealtimeStatusBadge";
import { confirmAction } from "../ui";
import { useAuth } from "../../context/AuthContext";
import useLanguage from "../../i18n/useLanguage";
import LanguageToggle from "../common/LanguageToggle";

const pageContext = [
  ["/admin/products", "pageTitles.productsTitle", "navbar.catalogWork"],
  ["/admin/categories", "pageTitles.categoriesTitle", "navbar.catalogWork"],
  ["/admin/branches", "pageTitles.branchesTitle", "navbar.workspaceSetup"],
  ["/admin/tables", "pageTitles.tablesTitle", "navbar.workspaceSetup"],
  ["/admin/orders", "pageTitles.ordersTitle", "navbar.liveOperations"],
  ["/admin/kitchen", "pageTitles.kitchenTitle", "navbar.liveOperations"],
  ["/admin/payments", "pageTitles.paymentsTitle", "navbar.liveOperations"],
  ["/admin/settings", "pageTitles.settingsTitle", "navbar.workspaceSetup"],
  ["/admin/staff", "pageTitles.staffTitle", "navbar.workspaceSetup"],
  ["/admin/reports", "pageTitles.reportsTitle", "navbar.businessReview"],
  ["/admin/system-health", "pageTitles.systemHealthTitle", "navbar.workspaceSetup"],
  ["/admin", "pageTitles.dashboardTitle", "navbar.controlTower"],
];

function getPageContext(pathname) {
  return pageContext.find(([path]) => pathname === path || (path !== "/admin" && pathname.startsWith(path))) || pageContext.at(-1);
}

export default function Navbar({ onOpenCommand }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [, titleKey, eyebrowKey] = getPageContext(pathname);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const displayName = user?.name || user?.email || t("navbar.accountFallback", "Account");
  const profilePhoto = user?.avatar_url || user?.profile_photo_url || user?.photo_url || user?.image_url;
  const initials = getInitials(displayName);

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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="khmer-label text-xs font-bold uppercase tracking-wide text-slate-500">{t(eyebrowKey)}</p>
          <h1 className="khmer-heading truncate text-lg font-black text-slate-950">{t(titleKey)}</h1>
        </div>
      </div>
      <button
        type="button"
        className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-500 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-slate-700 focus:outline-none focus-visible:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-50 md:flex lg:max-w-sm"
        aria-label={t("navbar.searchPlaceholder")}
        onClick={onOpenCommand}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-semibold">{t("navbar.searchPlaceholder")}</span>
        <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">Ctrl K</kbd>
      </button>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <RealtimeStatusBadge status="unavailable" className="hidden xl:inline-flex" />
        <button
          type="button"
          aria-label={t("navbar.searchPlaceholder")}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          onClick={onOpenCommand}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            aria-label={t("navbar.notificationsTitle", "Notifications")}
            aria-expanded={notificationsOpen}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </button>
          {notificationsOpen ? <NotificationPanel t={t} /> : null}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label={t("navbar.accountMenu", "Account menu")}
            aria-expanded={profileOpen}
            className="inline-flex h-11 min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 pr-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-w-44"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
          >
            <ProfileAvatar src={profilePhoto} name={displayName} initials={initials} t={t} />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-black text-slate-950">{displayName}</span>
              <span className="block truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">{user?.role || t("common.adminWorkspace")}</span>
            </span>
            <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition sm:block ${profileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {profileOpen ? (
            <div className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <ProfileAvatar src={profilePhoto} name={displayName} initials={initials} size="lg" t={t} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{user?.email || t("navbar.signedIn", "Signed in")}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-4">
                <div>
                  <p className="khmer-label mb-2 text-xs font-black uppercase tracking-wide text-slate-500">{t("common.language")}</p>
                  <LanguageToggle compact />
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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

function NotificationPanel({ t }) {
  return (
    <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="khmer-heading text-sm font-black text-slate-950">{t("navbar.notificationsTitle", "Notifications")}</p>
          <p className="khmer-text text-xs font-semibold text-slate-500">{t("navbar.notificationsSubtitle", "Operational alerts will appear here.")}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500">0</span>
      </div>
      <div className="grid gap-3 p-4">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <Bell className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
          <p className="khmer-heading mt-2 text-sm font-black text-slate-950">{t("navbar.notificationsEmpty", "No notifications yet")}</p>
          <p className="khmer-text mt-1 text-xs leading-5 text-slate-500">{t("navbar.notificationsEmptyDescription", "A backend notification inbox is not connected yet. Telegram alerts can be configured in settings.")}</p>
        </div>
        <Link
          to="/admin/settings"
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {t("navbar.notificationSettings", "Notification settings")}
        </Link>
      </div>
    </div>
  );
}

function ProfileAvatar({ src, name, initials, size = "md", t }) {
  const sizeClass = size === "lg" ? "h-12 w-12" : "h-9 w-9";

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
