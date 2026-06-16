import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import api from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import PaymentStatusCard from "../../components/public/PaymentStatusCard";
import { PublicPageSkeleton } from "../../components/public/PublicSkeletons";
import { AppButton, AppCard } from "../../design-system/components";
import { ErrorState, Input, Select, alertError, alertWarning, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { getPreferredLocale, normalizeLocale, t } from "../../utils/localization";

export default function PaymentPage() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const locale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState([]);
  const [paymentResult, setPaymentResult] = useState(null);
  const [form, setForm] = useState({ payment_method: "cash", transaction_reference: "", proof_image: null });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const online = useOnlineStatus();
  const proofPreview = useMemo(() => (
    form.proof_image ? URL.createObjectURL(form.proof_image) : ""
  ), [form.proof_image]);

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => {
        setOrder(response.data.data.order);
        setMethods(response.data.data.payment_methods || [
          { value: "cash", label: "Cash" },
          { value: "khqr_manual", label: "Manual KHQR" },
        ]);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Payment page could not be loaded."));
  }, [orderNumber]);

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  const submit = async (event) => {
    event.preventDefault();

    if (!online) {
      await alertWarning("You are offline", "Connect to the internet before submitting payment.");
      return;
    }

    const data = new FormData();
    data.append("payment_method", form.payment_method);
    if (form.transaction_reference) data.append("transaction_reference", form.transaction_reference);
    if (form.proof_image) data.append("proof_image", form.proof_image);

    try {
      setSaving(true);
      const response = await api.post(`/public/orders/${orderNumber}/payment`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setPaymentResult(response.data.data);
      toastSuccess("Payment submitted");
      api.get(`/public/orders/${orderNumber}`).then((response) => setOrder(response.data.data.order));
    } catch (error) {
      alertError(error, "Please review payment details.");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4">{!online ? <OfflineBanner /> : null}<ErrorState message={error} /></div>;
  if (!order) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4">{!online ? <OfflineBanner /> : null}<PublicPageSkeleton label="Loading payment..." /></div>;

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4 pb-24" lang={locale}>
      {!online ? <OfflineBanner locale={locale} /> : null}
      <p className="text-xs font-black uppercase tracking-wide text-blue-600">{t(locale, "payment")}</p>
      <h1 className="mt-1 text-3xl font-black text-slate-950">Complete payment</h1>
      <p className="mt-2 text-sm text-slate-500">Choose a payment method and submit proof if the restaurant requires manual review.</p>

      <div className="mt-5">
        <PaymentStatusCard order={order} />
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        <AppCard title="Payment method" description="No provider secrets or raw gateway data are shown here." bodyClassName="grid gap-3 p-4">
          <Select label="Payment method" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
            {methods.map((method) => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </Select>
          {form.payment_method === "khqr_manual" ? (
            <>
              <Input label="Transaction reference" placeholder="Reference number" value={form.transaction_reference} onChange={(event) => setForm({ ...form, transaction_reference: event.target.value })} />
              <Input label="Proof image" type="file" accept="image/*" onChange={(event) => setForm({ ...form, proof_image: event.target.files?.[0] || null })} />
              {proofPreview ? <img className="max-h-80 w-full rounded-2xl border border-slate-200 object-contain" src={proofPreview} alt="Selected payment proof preview" /> : null}
            </>
          ) : null}
          {form.payment_method === "bakong_khqr" ? (
            <p className="rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">Submit to generate a Bakong KHQR code for this order total.</p>
          ) : null}
          <AppButton type="submit" disabled={saving || !online} iconLeft={<UploadCloud className="h-4 w-4" />}>
            {saving ? "Submitting..." : "Submit payment"}
          </AppButton>
        </AppCard>
      </form>
      {paymentResult?.next_action === "show_qr" ? (
        <AppCard className="mt-5" bodyClassName="p-4">
          <p className="text-sm font-bold text-slate-950">Bakong KHQR</p>
          <p className="mt-1 text-sm text-slate-500">Scan this QR payload with a Bakong-compatible banking app.</p>
          {paymentResult.qr_image_url ? <img className="mt-4 w-full rounded-2xl border border-slate-200" src={paymentResult.qr_image_url} alt="Bakong KHQR" /> : null}
          {paymentResult.qr_payload ? (
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-white">{paymentResult.qr_payload}</pre>
          ) : null}
        </AppCard>
      ) : null}
    </div>
  );
}
