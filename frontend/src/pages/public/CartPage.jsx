import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { cartTotal, clearCart, itemTotal, money, optionSummary, readCart, unitPrice, writeCart } from "../../utils/cart";

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(readCart);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", note: "", order_type: searchParams.get("table") ? "dine_in" : "takeaway" });
  const [saving, setSaving] = useState(false);
  const total = cartTotal(cart);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  const changeQuantity = (key, quantity) => {
    setCart((items) => (
      quantity < 1
        ? items.filter((item) => item.key !== key)
        : items.map((item) => item.key === key ? { ...item, quantity, item_total: itemTotal({ ...item, quantity }) } : item)
    ));
  };

  const remove = (key) => {
    setCart((items) => items.filter((item) => item.key !== key));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.post("/public/orders", {
        shop_id: searchParams.get("shop"),
        branch_id: searchParams.get("branch"),
        table_code: searchParams.get("table") || null,
        ...form,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: item.note || null,
          selected_options: item.selected_options || [],
        })),
      });
      clearCart();
      setCart([]);
      await Swal.fire("Order submitted", response.data.data.order.order_number, "success");
      navigate(`/order-success/${response.data.data.order.order_number}`);
    } catch (error) {
      Swal.fire("Order failed", error.response?.data?.message || "Please review your cart.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white p-4">
      <h1 className="text-2xl font-bold text-slate-950">Cart</h1>
      <div className="mt-4 grid gap-3">
        {!cart.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Your cart is empty.</div> : null}
        {cart.map((item) => (
          <div key={item.key} className="rounded-md bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{item.name}</p>
                {optionSummary(item) ? <p className="mt-1 text-sm text-slate-500">{optionSummary(item)}</p> : null}
                <p className="mt-1 text-sm text-slate-500">{money(unitPrice(item))} KHR each</p>
              </div>
              <p className="shrink-0 font-bold text-orange-700">{money(itemTotal(item))} KHR</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => changeQuantity(item.key, item.quantity - 1)} className="h-8 w-8 rounded-md border border-slate-300">-</button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button type="button" onClick={() => changeQuantity(item.key, item.quantity + 1)} className="h-8 w-8 rounded-md border border-slate-300">+</button>
              </div>
              <button type="button" onClick={() => remove(item.key)} className="text-sm font-semibold text-rose-700">Remove</button>
            </div>
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
          <span className="font-bold text-orange-700">{money(total)} KHR</span>
        </div>
        <button disabled={!cart.length || saving || !searchParams.get("shop") || !searchParams.get("branch")} className="rounded-md bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
          {saving ? "Submitting..." : "Submit order"}
        </button>
      </form>
    </div>
  );
}
