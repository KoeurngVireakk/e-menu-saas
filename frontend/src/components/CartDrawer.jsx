export default function CartDrawer({ cart, onQuantity, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + Number(item.discount_price || item.price) * item.quantity, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-4 shadow-lg">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{cart.length} item types</p>
            <p className="text-lg font-bold text-slate-950">{total.toLocaleString()} KHR</p>
          </div>
          <button disabled={!cart.length} onClick={onCheckout} className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50">Checkout</button>
        </div>
        {cart.length ? (
          <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm">
                <span className="font-medium text-slate-900">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onQuantity(item.id, item.quantity - 1)} className="h-7 w-7 rounded-md border border-slate-300">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded-md border border-slate-300">+</button>
                  <button onClick={() => onRemove(item.id)} className="rounded-md px-2 text-rose-700">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
