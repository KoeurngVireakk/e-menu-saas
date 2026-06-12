import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import CartDrawer from "../../components/CartDrawer";
import ProductCard from "../../components/ProductCard";

export default function MenuPage() {
  const { shopSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("emenu_cart") || "[]"));
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get(`/public/shops/${shopSlug}/menu?${searchParams.toString()}`).then((response) => {
      setMenu(response.data.data);
      setActive(response.data.data.categories[0]?.id || "");
    });
  }, [shopSlug, searchParams]);

  useEffect(() => {
    localStorage.setItem("emenu_cart", JSON.stringify(cart));
  }, [cart]);

  const products = useMemo(() => {
    const category = menu?.categories?.find((item) => String(item.id) === String(active));
    return (category?.products || []).filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [menu, active, query]);

  const add = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { ...product, quantity: 1 }];
    });
    Swal.fire({ title: "Added", text: product.name, icon: "success", timer: 900, showConfirmButton: false });
  };

  if (!menu) return <div className="p-6">Loading menu...</div>;

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 pb-44">
      <div className="h-40 bg-slate-900" style={{ backgroundColor: menu.shop.primary_color || "#111827" }} />
      <div className="-mt-10 px-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">{menu.shop.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{menu.branch?.name} {menu.table ? `· ${menu.table.table_name}` : ""}</p>
          <input className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Search menu" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto px-4">
        {menu.categories.map((category) => (
          <button key={category.id} onClick={() => setActive(category.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${String(active) === String(category.id) ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}>
            {category.name}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 px-4">
        {products.map((product) => <ProductCard key={product.id} product={product} onAdd={add} onView={setSelected} />)}
      </div>
      {selected ? (
        <div className="fixed inset-0 z-30 grid place-items-end bg-slate-950/50 p-4 sm:place-items-center">
          <div className="w-full max-w-md rounded-md bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{selected.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md border border-slate-300 px-3 py-1">Close</button>
            </div>
            <p className="mt-4 font-bold text-orange-700">{Number(selected.discount_price || selected.price).toLocaleString()} KHR</p>
            <button onClick={() => { add(selected); setSelected(null); }} className="mt-4 w-full rounded-md bg-orange-600 px-4 py-2 font-semibold text-white">Add to cart</button>
          </div>
        </div>
      ) : null}
      <CartDrawer
        cart={cart}
        onQuantity={(id, quantity) => setCart((items) => quantity < 1 ? items.filter((item) => item.id !== id) : items.map((item) => item.id === id ? { ...item, quantity } : item))}
        onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))}
        onCheckout={() => navigate(`/cart?shop=${menu.shop.id}&branch=${menu.branch?.id || ""}&table=${menu.table?.table_code || ""}`)}
      />
    </div>
  );
}
