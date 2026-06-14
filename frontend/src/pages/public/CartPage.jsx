import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { Button, Card, EmptyState, Input, Select, Textarea, alertError, toastSuccess } from "../../components/ui";
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
      await toastSuccess(`Order ${response.data.data.order.order_number} submitted`);
      navigate(`/order-success/${response.data.data.order.order_number}`);
    } catch (error) {
      alertError(error, "Please review your cart.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-slate-50 p-4 pb-28">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Checkout</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Cart</h1>
      </div>
      <div className="mt-4 grid gap-3">
        {!cart.length ? <EmptyState title="Your cart is empty" message="Return to the menu and choose a product." /> : null}
        {cart.map((item) => (
          <motion.div key={item.key} className="rounded-2xl bg-white p-3 shadow-sm" layout>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-950">{item.name}</p>
                {optionSummary(item) ? <p className="mt-1 text-sm text-slate-500">{optionSummary(item)}</p> : null}
                <p className="mt-1 text-sm text-slate-500">{money(unitPrice(item))} KHR each</p>
              </div>
              <p className="shrink-0 font-bold text-orange-700">{money(itemTotal(item))} KHR</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="icon" onClick={() => changeQuantity(item.key, item.quantity - 1)}>-</Button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <Button type="button" variant="secondary" size="icon" onClick={() => changeQuantity(item.key, item.quantity + 1)}>+</Button>
              </div>
              <Button type="button" variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-50" onClick={() => remove(item.key)}>Remove</Button>
            </div>
          </motion.div>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <Card className="grid gap-3 p-4">
          <Input placeholder="Customer name" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
          <Input placeholder="Phone" value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} />
          <Select value={form.order_type} onChange={(event) => setForm({ ...form, order_type: event.target.value })}>
          <option value="dine_in">Dine in</option>
          <option value="takeaway">Takeaway</option>
          </Select>
          <Textarea placeholder="Order note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </Card>
        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-orange-700">{money(total)} KHR</span>
          <Button type="submit" disabled={!cart.length || saving || !searchParams.get("shop") || !searchParams.get("branch")}>
            {saving ? "Submitting..." : "Submit order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
