import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import { Button, Card, ErrorState, LoadingState } from "../../components/ui";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/public/orders/${orderNumber}`)
      .then((response) => setOrder(response.data.data.order))
      .catch((requestError) => setError(requestError.response?.data?.message || "Order could not be loaded."));
  }, [orderNumber]);

  if (error) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4"><ErrorState message={error} /></div>;
  if (!order) return <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4"><LoadingState message="Loading order..." /></div>;

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-slate-50 p-4 text-center">
      <Card className="mt-10 p-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">OK</div>
        <h1 className="mt-5 text-3xl font-black text-slate-950">Order submitted</h1>
        <p className="mt-2 text-slate-500">{order.order_number}</p>
        <div className="mt-4 flex justify-center gap-2">
          <StatusBadge value={order.order_status} />
          <StatusBadge value={order.payment_status} />
        </div>
        <p className="mt-6 text-4xl font-black text-orange-700">{Number(order.grand_total).toLocaleString()} KHR</p>
        <Button as={Link} variant="dark" size="lg" className="mt-6" to={`/payment/${order.order_number}`}>
          Continue to payment
        </Button>
      </Card>
    </div>
  );
}
