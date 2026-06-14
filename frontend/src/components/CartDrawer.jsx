import { motion } from "framer-motion";
import { cartTotal, itemTotal, money, optionSummary, unitPrice } from "../utils/cart";
import { Button, Drawer, EmptyState } from "./ui";

export default function CartDrawer({ cart, onQuantity, onRemove, onCheckout }) {
  const total = cartTotal(cart);

  return (
    <Drawer className="rounded-t-3xl p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{cart.length} item types</p>
            <p className="text-xl font-black text-slate-950">{money(total)} KHR</p>
          </div>
          <Button type="button" variant="dark" disabled={!cart.length} onClick={onCheckout}>Checkout</Button>
        </div>
        {cart.length ? (
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto">
            {cart.map((item) => (
              <motion.div
                key={item.key}
                className="rounded-2xl bg-slate-50 p-3 text-sm"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {optionSummary(item) ? <p className="mt-0.5 text-xs text-slate-500">{optionSummary(item)}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">{money(unitPrice(item))} KHR each</p>
                  </div>
                  <p className="shrink-0 font-semibold text-orange-700">{money(itemTotal(item))} KHR</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="icon" onClick={() => onQuantity(item.key, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button type="button" variant="secondary" size="icon" onClick={() => onQuantity(item.key, item.quantity + 1)}>+</Button>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-rose-700 hover:bg-rose-50" onClick={() => onRemove(item.key)}>Remove</Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState title="Cart is empty" message="Choose a product to start an order." />
          </div>
        )}
      </div>
    </Drawer>
  );
}
