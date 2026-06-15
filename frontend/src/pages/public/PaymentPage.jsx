import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import StatusBadge from "../../components/StatusBadge";
import { Button, Card, ErrorState, Input, LoadingState, Select, alertError, alertWarning, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { formatCurrency } from "../../utils/currency";
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
  if (!order) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4">{!online ? <OfflineBanner /> : null}<LoadingState message="Loading payment..." /></div>;

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4" lang={locale}>
      {!online ? <OfflineBanner locale={locale} /> : null}
      <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{t(locale, "payment")}</p>
      <h1 className="mt-1 text-3xl font-black text-slate-950">Complete payment</h1>
      <p className="mt-1 text-slate-500">{order.order_number}</p>
      <Card className="mt-5 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-600">Amount</span>
          <span className="text-xl font-black text-orange-700">{formatCurrency(order.grand_total, order.currency_code || order.shop.currency_code)}</span>
        </div>
        {order.payment ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge value={order.payment.status} />
            {order.payment.provider === "bakong_khqr" ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Bakong KHQR</span> : null}
          </div>
        ) : null}
      </Card>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <Select label="Payment method" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
          {methods.map((method) => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </Select>
        {form.payment_method === "khqr_manual" ? (
          <>
            <Input label="Transaction reference" placeholder="Reference number" value={form.transaction_reference} onChange={(event) => setForm({ ...form, transaction_reference: event.target.value })} />
            <Input label="Proof image" type="file" accept="image/*" onChange={(event) => setForm({ ...form, proof_image: event.target.files?.[0] || null })} />
          </>
        ) : null}
        {form.payment_method === "bakong_khqr" ? (
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">Submit to generate a Bakong KHQR code for this order total.</p>
        ) : null}
        <Button type="submit" disabled={saving || !online} size="lg">
          {saving ? "Submitting..." : "Submit payment"}
        </Button>
      </form>
      {paymentResult?.next_action === "show_qr" ? (
        <Card className="mt-5 p-4">
          <p className="text-sm font-bold text-slate-950">Bakong KHQR</p>
          <p className="mt-1 text-sm text-slate-500">Scan this QR payload with a Bakong-compatible banking app.</p>
          {paymentResult.qr_image_url ? <img className="mt-4 w-full rounded-md border border-slate-200" src={paymentResult.qr_image_url} alt="Bakong KHQR" /> : null}
          {paymentResult.qr_payload ? (
            <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-white">{paymentResult.qr_payload}</pre>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
