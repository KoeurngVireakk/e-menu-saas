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
      await alertWarning(t(locale, "offlineTitle"), t(locale, "paymentOfflineSubmit"));
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
      toastSuccess(t(locale, "paymentSubmitted"));
      api.get(`/public/orders/${orderNumber}`).then((response) => setOrder(response.data.data.order));
    } catch (error) {
      alertError(error, t(locale, "paymentReviewDetails"));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{!online ? <OfflineBanner /> : null}<ErrorState message={error} /></div>;
  if (!order) return <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{!online ? <OfflineBanner /> : null}<PublicPageSkeleton label="Loading payment..." /></div>;

  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-slate-50 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]" lang={locale}>
      {!online ? <OfflineBanner locale={locale} /> : null}
      <p className="khmer-label text-xs font-black text-blue-600">{t(locale, "payment")}</p>
      <h1 className="khmer-heading mt-1 text-3xl font-black text-slate-950">{t(locale, "completePayment")}</h1>
      <p className="khmer-text mt-2 text-sm text-slate-500">{t(locale, "paymentPageDescription")}</p>

      <div className="mt-5">
        <PaymentStatusCard order={order} />
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        <AppCard title={t(locale, "paymentMethod")} description={t(locale, "paymentSafeDescription")} bodyClassName="grid gap-3 p-4">
          {!online ? (
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
              {t(locale, "paymentOfflineSubmit")}
            </p>
          ) : null}
          <Select label={t(locale, "paymentMethod")} value={form.payment_method} disabled={!online} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
            {methods.map((method) => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </Select>
          {form.payment_method === "khqr_manual" ? (
            <>
              <Input label={t(locale, "transactionReference")} placeholder={t(locale, "referenceNumber")} disabled={!online} value={form.transaction_reference} onChange={(event) => setForm({ ...form, transaction_reference: event.target.value })} />
              <Input label={t(locale, "proofImage")} type="file" accept="image/*" disabled={!online} description={t(locale, "paymentOfflineSubmit")} onChange={(event) => setForm({ ...form, proof_image: event.target.files?.[0] || null })} />
              {proofPreview ? (
                <figure className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <figcaption className="khmer-label mb-2 text-xs font-black text-slate-500">{t(locale, "proofPreview")}</figcaption>
                  <img className="max-h-[min(20rem,50dvh)] w-full rounded-2xl border border-slate-200 bg-white object-contain" src={proofPreview} alt={t(locale, "proofPreviewAlt")} />
                </figure>
              ) : null}
            </>
          ) : null}
          {form.payment_method === "bakong_khqr" ? (
            <p className="rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{t(locale, "bakongQrHelp")}</p>
          ) : null}
          <AppButton type="submit" fullWidth disabled={saving || !online} title={!online ? t(locale, "paymentOfflineSubmit") : undefined} iconLeft={<UploadCloud className="h-4 w-4" />}>
            {saving ? t(locale, "submitting") : t(locale, "submitPayment")}
          </AppButton>
        </AppCard>
      </form>
      {paymentResult?.next_action === "show_qr" ? (
        <AppCard className="mt-5" bodyClassName="p-4">
          <p className="text-sm font-bold text-slate-950">Bakong KHQR</p>
          <p className="mt-1 text-sm text-slate-500">{t(locale, "bakongScanHelp")}</p>
          {paymentResult.qr_image_url ? <img className="mt-4 w-full rounded-2xl border border-slate-200" src={paymentResult.qr_image_url} alt="Bakong KHQR" /> : null}
          {paymentResult.qr_payload ? (
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-white">{paymentResult.qr_payload}</pre>
          ) : null}
        </AppCard>
      ) : null}
    </div>
  );
}
