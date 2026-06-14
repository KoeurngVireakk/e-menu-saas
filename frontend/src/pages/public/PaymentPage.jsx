import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import StatusBadge from "../../components/StatusBadge";
import { Button, Card, ErrorState, Input, LoadingState, Select, alertError, alertWarning, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";

export default function PaymentPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ payment_method: "cash", transaction_reference: "", proof_image: null });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => setOrder(response.data.data.order))
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
      await api.post(`/public/orders/${orderNumber}/payment`, data, { headers: { "Content-Type": "multipart/form-data" } });
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
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4">
      {!online ? <OfflineBanner /> : null}
      <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Payment</p>
      <h1 className="mt-1 text-3xl font-black text-slate-950">Complete payment</h1>
      <p className="mt-1 text-slate-500">{order.order_number}</p>
      <Card className="mt-5 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-600">Amount</span>
          <span className="text-xl font-black text-orange-700">{Number(order.grand_total).toLocaleString()} {order.shop.currency_code}</span>
        </div>
        {order.payment ? <div className="mt-3"><StatusBadge value={order.payment.status} /></div> : null}
      </Card>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <Select label="Payment method" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
          <option value="cash">Cash</option>
          <option value="aba_manual">ABA manual QR</option>
          <option value="khqr_manual">KHQR manual</option>
        </Select>
        {form.payment_method !== "cash" ? (
          <>
            <Input label="Transaction reference" placeholder="Reference number" value={form.transaction_reference} onChange={(event) => setForm({ ...form, transaction_reference: event.target.value })} />
            <Input label="Proof image" type="file" accept="image/*" onChange={(event) => setForm({ ...form, proof_image: event.target.files?.[0] || null })} />
          </>
        ) : null}
        <Button type="submit" disabled={saving || !online} size="lg">
          {saving ? "Submitting..." : "Submit payment"}
        </Button>
      </form>
    </div>
  );
}
