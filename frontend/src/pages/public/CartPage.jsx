import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("emenu_cart") || "[]"));
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", note: "", order_type: searchParams.get("table") ? "dine_in" : "takeaway" });
  const total = cart.reduce((sum, item) => sum + Number(item.discount_price || item.price) * item.quantity, 0);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/public/orders", {
        shop_id: searchParams.get("shop"),
        branch_id: searchParams.get("branch"),
        table_code: searchParams.get("table") || null,
        ...form,
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      localStorage.removeItem("emenu_cart");
      setCart([]);
      await Swal.fire("Order submitted", response.data.data.order.order_number, "success");
      navigate(`/order-success/${response.data.data.order.order_number}`);
    } catch (error) {
      Swal.fire("Order failed", error.response?.data?.message || "Please review your cart.", "error");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white p-4">
      <h1 className="text-2xl font-bold text-slate-950">Cart</h1>
      <div className="mt-4 grid gap-2">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="text-sm text-slate-500">{item.quantity} x {Number(item.discount_price || item.price).toLocaleString()} KHR</p>
            </div>
            <button onClick={() => { const next = cart.filter((row) => row.id !== item.id); setCart(next); localStorage.setItem("emenu_cart", JSON.stringify(next)); }} className="text-sm font-semibold text-rose-700">Remove</button>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Customer name" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Phone" value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.order_type} onChange={(event) => setForm({ ...form, order_type: event.target.value })}>
          <option value="dine_in">Dine in</option>
          <option value="takeaway">Takeaway</option>
        </select>
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Order note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-orange-700">{total.toLocaleString()} KHR</span>
        </div>
        <button disabled={!cart.length} className="rounded-md bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Submit order</button>
      </form>
    </div>
  );
}
