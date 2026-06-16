import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { alertError } from "../../components/ui";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import useLanguage from "../../i18n/useLanguage";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
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
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4 text-left">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <AppLogo size="lg" to="/login" ariaLabel="Go to home" />
          <LanguageToggle compact />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">{t("common.signIn")}</h1>
        <p className="mt-1 text-sm text-slate-500">Manage shops, menus, orders, and payments.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <button disabled={saving} className="mt-6 w-full rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
          {saving ? `${t("common.loading")}...` : t("common.signIn")}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          New shop owner? <Link className="font-semibold text-orange-700" to="/register">{t("common.register")}</Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">Demo: owner@example.com / password</p>
      </form>
    </div>
  );
}
