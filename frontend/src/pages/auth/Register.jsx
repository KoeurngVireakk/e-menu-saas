import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { alertError } from "../../components/ui";
import { AppButton } from "../../design-system/components";
import AppLogo from "../../components/common/AppLogo";
import LanguageToggle from "../../components/common/LanguageToggle";
import useLanguage from "../../i18n/useLanguage";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useLanguage();

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await register(form);
      navigate("/admin");
    } catch (error) {
      alertError(error, "Please review the form.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_30%),linear-gradient(135deg,#F8FAFC,#EEF2F7)] p-4 text-left">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-white/70 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <AppLogo size="lg" to="/register" ariaLabel="Go to home" />
            <LanguageToggle compact />
          </div>
          <h1 className="text-3xl font-black text-slate-950">{t("common.register")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Create your owner account and start building a QR ordering workspace.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <AuthField icon={UserRound} label="Name" required value={form.name} onChange={(event) => update("name", event.target.value)} />
            <AuthField icon={Phone} label="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </div>
          <AuthField icon={Mail} className="mt-4" label="Email" type="email" required value={form.email} onChange={(event) => update("email", event.target.value)} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PasswordField label="Password" value={form.password} show={showPassword} onToggle={() => setShowPassword((value) => !value)} onChange={(event) => update("password", event.target.value)} />
            <PasswordField label="Confirm password" value={form.password_confirmation} show={showConfirm} onToggle={() => setShowConfirm((value) => !value)} onChange={(event) => update("password_confirmation", event.target.value)} />
          </div>
          <AppButton type="submit" loading={saving} fullWidth className="mt-6">
            {saving ? `${t("common.loading")}...` : t("common.register")}
          </AppButton>
          <p className="mt-5 text-center text-sm text-slate-600">
            Already registered? <Link className="font-black text-blue-700 hover:text-blue-800" to="/login">{t("common.signIn")}</Link>
          </p>
        </form>
        <aside className="hidden bg-slate-950 p-8 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2 className="text-4xl font-black leading-tight">Build a premium QR ordering experience.</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Menus", "Tables", "Orders", "Payments"].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm font-black text-blue-100">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AuthField({ icon: Icon, label, className = "", ...props }) {
  return (
    <label className={`block text-sm font-bold text-slate-700 ${className}`}>
      {label}
      <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
        <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input className="w-full bg-transparent outline-none" {...props} />
      </span>
    </label>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
        <LockKeyhole className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input className="w-full bg-transparent outline-none" type={show ? "text" : "password"} required value={value} onChange={onChange} />
        <button type="button" aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={onToggle}>
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
