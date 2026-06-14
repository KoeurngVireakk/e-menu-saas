import { cartTotal, itemTotal, money, optionSummary, unitPrice } from "../utils/cart";

export default function CartDrawer({ cart, onQuantity, onRemove, onCheckout }) {
  const total = cartTotal(cart);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-4 shadow-lg">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{cart.length} item types</p>
            <p className="text-lg font-bold text-slate-950">{money(total)} KHR</p>
          </div>
          <button disabled={!cart.length} onClick={onCheckout} className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50">Checkout</button>
        </div>
        {cart.length ? (
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.key} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {optionSummary(item) ? <p className="mt-0.5 text-xs text-slate-500">{optionSummary(item)}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">{money(unitPrice(item))} KHR each</p>
                  </div>
                  <p className="shrink-0 font-semibold text-orange-700">{money(itemTotal(item))} KHR</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onQuantity(item.key, item.quantity - 1)} className="h-7 w-7 rounded-md border border-slate-300">-</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => onQuantity(item.key, item.quantity + 1)} className="h-7 w-7 rounded-md border border-slate-300">+</button>
                  </div>
                  <button onClick={() => onRemove(item.key)} className="rounded-md px-2 font-semibold text-rose-700">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
