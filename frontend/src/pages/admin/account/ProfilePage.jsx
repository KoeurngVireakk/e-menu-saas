import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Save, ShieldCheck, UserRound } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { ErrorState, Input, LoadingState, Select, alertError, toastSuccess } from "../../../components/ui";
import AppBadge from "../../../design-system/components/AppBadge";
import AppButton from "../../../design-system/components/AppButton";
import AppCard from "../../../design-system/components/AppCard";
import AppPageHeader from "../../../design-system/components/AppPageHeader";
import { useAccountActivity, useAccountProfile } from "../../../hooks/useApiQueries";
import useLanguage from "../../../i18n/useLanguage";
import { queryKeys } from "../../../lib/queryKeys";

const personalInitial = { name: "", phone: "" };
const preferenceInitial = {
  language: "en",
  timezone: "Asia/Phnom_Penh",
  date_format: "yyyy-mm-dd",
  dashboard_default_range: "today",
  notifications: { orders: true, payments: true, system: true },
};
const passwordInitial = { current_password: "", new_password: "", new_password_confirmation: "" };

export default function ProfilePage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const profileQuery = useAccountProfile();
  const activityQuery = useAccountActivity();
  const profile = profileQuery.data;
  const activity = activityQuery.data?.activity || [];
  const [personal, setPersonal] = useState(personalInitial);
  const [preferences, setPreferences] = useState(preferenceInitial);
  const [passwords, setPasswords] = useState(passwordInitial);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordClientError, setPasswordClientError] = useState("");

  useEffect(() => {
    if (profile) {
      const timer = window.setTimeout(() => {
        setPersonal({ name: profile.name || "", phone: profile.phone || "" });
        setPreferences({ ...preferenceInitial, ...(profile.preferences || {}) });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [profile]);

  const initials = useMemo(() => getInitials(profile?.name || profile?.email || "A"), [profile]);

  const profileMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.put("/account/profile", payload);
      return response.data.data.profile;
    },
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(queryKeys.accountProfile, updatedProfile);
      queryClient.setQueryData(queryKeys.currentUser, (current) => (current ? { ...current, name: updatedProfile.name, phone: updatedProfile.phone } : current));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountActivity });
      await toastSuccess(t("account.profileUpdated", "Profile updated."));
    },
    onError: (error) => alertError(error, t("account.profileUpdateError", "Please review your profile details.")),
  });

  const preferenceMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.put("/account/preferences", payload);
      return response.data.data.preferences;
    },
    onSuccess: async (updatedPreferences) => {
      queryClient.setQueryData(queryKeys.accountProfile, (current) => (current ? { ...current, preferences: updatedPreferences } : current));
      queryClient.setQueryData(queryKeys.accountPreferences, updatedPreferences);
      queryClient.invalidateQueries({ queryKey: queryKeys.accountActivity });
      await toastSuccess(t("account.preferencesUpdated", "Preferences saved."));
    },
    onError: (error) => alertError(error, t("account.preferencesUpdateError", "Please review your preferences.")),
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload) => api.put("/account/password", payload),
    onSuccess: async () => {
      setPasswords(passwordInitial);
      setPasswordClientError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.accountActivity });
      await toastSuccess(t("account.passwordUpdated", "Password updated."));
    },
    onError: (error) => alertError(error, t("account.passwordUpdateError", "Please review your password details.")),
  });

  const submitPassword = (event) => {
    event.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) {
      setPasswordClientError(t("account.passwordMismatch", "New password and confirmation must match."));
      return;
    }
    setPasswordClientError("");
    passwordMutation.mutate(passwords);
  };

  if (profileQuery.isLoading) {
    return <LoadingState message={t("account.loadingProfile", "Loading profile...")} />;
  }

  if (profileQuery.isError) {
    return <ErrorState message={t("account.loadProfileError", "Unable to load your profile.")} onRetry={profileQuery.refetch} />;
  }

  return (
    <div className="grid gap-4">
      <AppPageHeader
        eyebrow={t("account.eyebrow", "Account")}
        title={t("account.profileTitle", "Profile")}
        description={t("account.profileSubtitle", "Manage your account details, password, and workspace preferences.")}
      />

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid h-fit gap-4">
          <AppCard bodyClassName="grid gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-blue-600 text-xl font-black text-white shadow-sm shadow-blue-600/20">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="khmer-heading truncate text-xl font-black text-slate-950">{profile?.name}</h1>
                <p className="truncate text-sm font-semibold text-slate-500">{profile?.email}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <SummaryRow label={t("account.role", "Role")} value={profile?.role} />
              <SummaryRow label={t("account.status", "Account status")} value={<AppBadge status={profile?.status === "active" ? "success" : "warning"}>{profile?.status}</AppBadge>} />
              <SummaryRow label={t("account.createdAt", "Created")} value={formatDate(profile?.created_at)} />
            </div>
          </AppCard>

          <AppCard title={t("account.activityTitle", "Account activity & help")} description={t("account.activityDescription", "Profile changes are limited to your own account. Role and status are managed by authorized administrators.")} bodyClassName="grid gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" aria-hidden="true" />
              <p className="khmer-text text-sm font-semibold leading-6 text-slate-600">
                {t("account.securityNote", "For security, password changes require your current password and never expose stored password data.")}
              </p>
            </div>
          </AppCard>

          <AppCard title={t("account.recentActivity", "Recent account activity")} description={t("account.recentActivityHelp", "Security-relevant profile, preference, login, and password events for your account.")} bodyClassName="grid gap-2">
            {activityQuery.isLoading ? <p className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">{t("account.loadingActivity", "Loading activity...")}</p> : null}
            {!activityQuery.isLoading && !activity.length ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">{t("account.noActivity", "No account activity yet.")}</p>
            ) : null}
            {activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="khmer-heading truncate text-sm font-black text-slate-950">{activityTitle(item, t)}</p>
                    <p className="khmer-text mt-1 text-xs leading-5 text-slate-500">{activityDescription(item, t)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{activityType(item.type, t)}</span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-slate-400">{formatDateTime(item.created_at)}</p>
              </div>
            ))}
          </AppCard>
        </div>

        <div className="grid gap-4">
          <AppCard title={t("account.personalInfo", "Personal information")} description={t("account.personalInfoHelp", "Name and phone are saved to your authenticated user profile. Email is read-only until a verified email-change flow is available.")} labelled bodyClassName="grid gap-4">
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); profileMutation.mutate(personal); }}>
              <Input label={t("auth.name", "Name")} required value={personal.name} onChange={(event) => setPersonal({ ...personal, name: event.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={t("auth.phone", "Phone")} value={personal.phone || ""} onChange={(event) => setPersonal({ ...personal, phone: event.target.value })} />
                <Input label={t("auth.email", "Email")} type="email" value={profile?.email || ""} disabled description={t("account.emailReadOnly", "Email changes need verification before this field can be editable.")} />
              </div>
              <div className="flex justify-end">
                <AppButton type="submit" loading={profileMutation.isPending} disabled={profileMutation.isPending} iconLeft={<Save className="h-4 w-4" aria-hidden="true" />}>
                  {t("account.savePersonal", "Save personal information")}
                </AppButton>
              </div>
            </form>
          </AppCard>

          <AppCard title={t("account.security", "Security")} description={t("account.changePasswordHelp", "Use a strong password with at least 8 characters.")} labelled bodyClassName="grid gap-4">
            <form className="grid gap-4" onSubmit={submitPassword}>
              {passwordClientError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700" role="alert">{passwordClientError}</p> : null}
              <PasswordInput label={t("account.currentPassword", "Current password")} value={passwords.current_password} visible={showPasswords} onChange={(value) => setPasswords({ ...passwords, current_password: value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordInput label={t("account.newPassword", "New password")} value={passwords.new_password} visible={showPasswords} onChange={(value) => setPasswords({ ...passwords, new_password: value })} />
                <PasswordInput label={t("account.confirmPassword", "Confirm password")} value={passwords.new_password_confirmation} visible={showPasswords} onChange={(value) => setPasswords({ ...passwords, new_password_confirmation: value })} />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" className="khmer-button inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setShowPasswords((value) => !value)}>
                  {showPasswords ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  {showPasswords ? t("account.hidePasswords", "Hide passwords") : t("account.showPasswords", "Show passwords")}
                </button>
                <AppButton type="submit" loading={passwordMutation.isPending} disabled={passwordMutation.isPending} iconLeft={<LockKeyhole className="h-4 w-4" aria-hidden="true" />}>
                  {t("account.updatePassword", "Update password")}
                </AppButton>
              </div>
            </form>
          </AppCard>

          <AppCard title={t("account.preferences", "Preferences")} description={t("account.preferencesHelp", "Save workspace display preferences for this account.")} labelled bodyClassName="grid gap-4">
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); preferenceMutation.mutate(preferences); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label={t("common.language", "Language")} value={preferences.language} onChange={(event) => setPreferences({ ...preferences, language: event.target.value })}>
                  <option value="en">English</option>
                  <option value="km">ខ្មែរ</option>
                </Select>
                <Select label={t("account.timezone", "Timezone")} value={preferences.timezone} onChange={(event) => setPreferences({ ...preferences, timezone: event.target.value })}>
                  <option value="Asia/Phnom_Penh">Asia/Phnom Penh</option>
                  <option value="UTC">UTC</option>
                </Select>
                <Select label={t("account.dateFormat", "Date format")} value={preferences.date_format} onChange={(event) => setPreferences({ ...preferences, date_format: event.target.value })}>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mmm d, yyyy">MMM D, YYYY</option>
                </Select>
                <Select label={t("account.dashboardRange", "Dashboard default range")} value={preferences.dashboard_default_range} onChange={(event) => setPreferences({ ...preferences, dashboard_default_range: event.target.value })}>
                  <option value="today">{t("overview.periods.today", "Today")}</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <PreferenceToggle label={t("notifications.orders", "Orders")} checked={preferences.notifications?.orders} onChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, orders: checked } })} />
                <PreferenceToggle label={t("notifications.payments", "Payments")} checked={preferences.notifications?.payments} onChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, payments: checked } })} />
                <PreferenceToggle label={t("notifications.system", "System")} checked={preferences.notifications?.system} onChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, system: checked } })} />
              </div>
              <div className="flex justify-end">
                <AppButton type="submit" loading={preferenceMutation.isPending} disabled={preferenceMutation.isPending} iconLeft={<UserRound className="h-4 w-4" aria-hidden="true" />}>
                  {t("account.savePreferences", "Save preferences")}
                </AppButton>
              </div>
            </form>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-900">{value || "—"}</span>
    </div>
  );
}

function PasswordInput({ label, value, visible, onChange }) {
  return <Input label={label} type={visible ? "text" : "password"} required value={value} autoComplete="new-password" onChange={(event) => onChange(event.target.value)} />;
}

function PreferenceToggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
      <span>{label}</span>
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
    </label>
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

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function activityType(type, t) {
  return t(`accountActivity.types.${type}`, type?.replaceAll("_", " ") || "activity");
}

function activityTitle(item, t) {
  return t(`accountActivity.titles.${item.type}`, item.title || activityType(item.type, t));
}

function activityDescription(item, t) {
  return t(`accountActivity.descriptions.${item.type}`, item.description || "");
}
