import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await register(form);
      navigate("/admin");
    } catch (error) {
      Swal.fire("Registration failed", error.response?.data?.message || "Please review the form.", "error");
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4 text-left">
      <form onSubmit={submit} className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Create shop owner account</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" required value={form.name} onChange={(event) => update("name", event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Email
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="email" required value={form.email} onChange={(event) => update("email", event.target.value)} />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" required value={form.password} onChange={(event) => update("password", event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" required value={form.password_confirmation} onChange={(event) => update("password_confirmation", event.target.value)} />
          </label>
        </div>
        <button disabled={saving} className="mt-6 w-full rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
          {saving ? "Creating..." : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-orange-700" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
