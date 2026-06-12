import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/public/orders/${orderNumber}`).then((response) => setOrder(response.data.data.order));
  }, [orderNumber]);

  if (!order) return <div className="p-6">Loading order...</div>;

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-white p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-950">Order submitted</h1>
      <p className="mt-2 text-slate-500">{order.order_number}</p>
      <div className="mt-4 flex justify-center gap-2">
        <StatusBadge value={order.order_status} />
        <StatusBadge value={order.payment_status} />
      </div>
      <p className="mt-6 text-3xl font-bold text-orange-700">{Number(order.grand_total).toLocaleString()} KHR</p>
      <Link className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 font-semibold text-white" to={`/payment/${order.order_number}`}>Continue to payment</Link>
    </div>
  );
}
