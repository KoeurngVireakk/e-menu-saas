import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { alertError } from "../../components/ui";
import { AppButton } from "../../design-system/components";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import useLanguage from "../../i18n/useLanguage";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await login(form);
      const nextPath = searchParams.get("next");
      navigate(nextPath?.startsWith("/admin") ? nextPath : "/admin");
    } catch (error) {
      alertError(error, "Check your email and password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_30%),linear-gradient(135deg,#F8FAFC,#EEF2F7)] p-4 text-left">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-white/70 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden bg-slate-950 p-8 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <AppLogo size="lg" to="/" ariaLabel="Go to home" />
              <h2 className="mt-10 text-4xl font-black leading-tight">{t("auth.welcomeBack")}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">Manage QR menus, customer orders, kitchen activity, and payment confirmation with a premium MenuDIGI dashboard.</p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              {["QR menu ready", "Kitchen workflow", "Payment review"].map((item) => (
                <p key={item} className="text-sm font-bold text-blue-100">{item}</p>
              ))}
            </div>
          </div>
        </aside>
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <AppLogo size="lg" to="/login" ariaLabel="Go to home" />
            <LanguageToggle compact />
          </div>
          <h1 className="text-3xl font-black text-slate-950">{t("common.signIn")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Manage shops, menus, orders, and payments.</p>
          <label className="mt-7 block text-sm font-bold text-slate-700">
            {t("auth.email")}
            <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input className="w-full bg-transparent outline-none" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </span>
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            {t("auth.password")}
            <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <LockKeyhole className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input className="w-full bg-transparent outline-none" type={showPassword ? "text" : "password"} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </label>
          <p className="mt-3 text-xs font-semibold text-slate-500">{t("auth.resetUnavailable")}</p>
          <AppButton type="submit" loading={saving} fullWidth className="mt-6">
            {saving ? `${t("common.loading")}...` : t("common.signIn")}
          </AppButton>
          <p className="mt-5 text-center text-sm text-slate-600">
            New shop owner? <Link className="font-black text-blue-700 hover:text-blue-800" to="/register">{t("common.register")}</Link>
          </p>
          <p className="mt-3 text-center text-xs text-slate-500">Demo: owner@example.com / password</p>
        </form>
      </div>
    </div>
  );
}
