import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function PaymentPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ payment_method: "cash", transaction_reference: "", proof_image: null });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => setOrder(response.data.data.order))
      .catch((requestError) => setError(requestError.response?.data?.message || "Payment page could not be loaded."));
  }, [orderNumber]);

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("payment_method", form.payment_method);
    if (form.transaction_reference) data.append("transaction_reference", form.transaction_reference);
    if (form.proof_image) data.append("proof_image", form.proof_image);

    try {
      setSaving(true);
      await api.post(`/public/orders/${orderNumber}/payment`, data, { headers: { "Content-Type": "multipart/form-data" } });
      Swal.fire("Payment submitted", "Staff will review your payment.", "success");
      api.get(`/public/orders/${orderNumber}`).then((response) => setOrder(response.data.data.order));
    } catch (error) {
      Swal.fire("Payment failed", error.response?.data?.message || "Please review payment details.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-6 text-rose-700">{error}</div>;
  if (!order) return <div className="p-6 text-slate-600">Loading payment...</div>;

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-950">Payment</h1>
      <p className="mt-1 text-slate-500">{order.order_number}</p>
      <div className="mt-4 flex items-center justify-between rounded-md bg-slate-50 p-4">
        <span className="font-semibold">Amount</span>
        <span className="font-bold text-orange-700">{Number(order.grand_total).toLocaleString()} {order.shop.currency_code}</span>
      </div>
      {order.payment ? <div className="mt-3"><StatusBadge value={order.payment.status} /></div> : null}
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
          <option value="cash">Cash</option>
          <option value="aba_manual">ABA manual QR</option>
          <option value="khqr_manual">KHQR manual</option>
        </select>
        {form.payment_method !== "cash" ? (
          <>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Transaction reference" value={form.transaction_reference} onChange={(event) => setForm({ ...form, transaction_reference: event.target.value })} />
            <input className="rounded-md border border-slate-300 px-3 py-2" type="file" accept="image/*" onChange={(event) => setForm({ ...form, proof_image: event.target.files?.[0] || null })} />
          </>
        ) : null}
        <button disabled={saving} className="rounded-md bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {saving ? "Submitting..." : "Submit payment"}
        </button>
      </form>
    </div>
  );
}
