import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import CartDrawer from "../../components/CartDrawer";
import ProductCard from "../../components/ProductCard";
import { cartItemKey, itemTotal, money, productBasePrice, readCart, writeCart } from "../../utils/cart";

export default function MenuPage() {
  const { shopSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(readCart);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api
      .get(`/public/shops/${shopSlug}/menu?${searchParams.toString()}`)
      .then((response) => {
        setMenu(response.data.data);
        setActive(response.data.data.categories[0]?.id || "");
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Menu is not available right now."));
  }, [shopSlug, searchParams]);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  const products = useMemo(() => {
    const category = menu?.categories?.find((item) => String(item.id) === String(active));
    return (category?.products || []).filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [menu, active, query]);

  const addConfiguredItem = (cartItem) => {
    setCart((items) => {
      const existing = items.find((item) => item.key === cartItem.key);
      if (existing) {
        return items.map((item) => {
          if (item.key !== cartItem.key) {
            return item;
          }

          const quantity = item.quantity + cartItem.quantity;
          return { ...item, quantity, item_total: itemTotal({ ...item, quantity }) };
        });
      }

      return [...items, cartItem];
    });
    Swal.fire({ title: "Added", text: cartItem.name, icon: "success", timer: 900, showConfirmButton: false });
  };

  if (error) return <div className="p-6 text-rose-700">{error}</div>;
  if (!menu) return <div className="p-6 text-slate-600">Loading menu...</div>;

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 pb-52">
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
        {products.map((product) => <ProductCard key={product.id} product={product} onAdd={setSelected} onView={setSelected} />)}
        {!products.length ? <div className="rounded-md bg-white p-6 text-sm text-slate-500">No products found.</div> : null}
      </div>
      {selected ? <ProductOptionsModal product={selected} onClose={() => setSelected(null)} onAdd={addConfiguredItem} /> : null}
      <CartDrawer
        cart={cart}
        onQuantity={(key, quantity) => setCart((items) => (
          quantity < 1
            ? items.filter((item) => item.key !== key)
            : items.map((item) => item.key === key ? { ...item, quantity, item_total: itemTotal({ ...item, quantity }) } : item)
        ))}
        onRemove={(key) => setCart((items) => items.filter((item) => item.key !== key))}
        onCheckout={() => navigate(`/cart?shop=${menu.shop.id}&branch=${menu.branch?.id || ""}&table=${menu.table?.table_code || ""}`)}
      />
    </div>
  );
}

function ProductOptionsModal({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState({});
  const imageUrl = product.image_path
    ? `${import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage"}/${product.image_path}`
    : null;

  const selectedOptions = useMemo(
    () => buildSelectedOptions(product, selectedValues),
    [product, selectedValues],
  );
  const selectedExtra = selectedOptions.reduce((sum, option) => (
    sum + option.values.reduce((valueSum, value) => valueSum + Number(value.extra_price || 0), 0)
  ), 0);
  const basePrice = productBasePrice(product);
  const liveUnitPrice = basePrice + selectedExtra;
  const liveTotal = liveUnitPrice * quantity;

  const setSingle = (optionId, valueId) => {
    setSelectedValues((current) => ({ ...current, [optionId]: [Number(valueId)] }));
  };

  const toggleMultiple = (optionId, valueId) => {
    setSelectedValues((current) => {
      const currentValues = current[optionId] || [];
      const id = Number(valueId);
      const nextValues = currentValues.includes(id)
        ? currentValues.filter((value) => value !== id)
        : [...currentValues, id];

      return { ...current, [optionId]: nextValues };
    });
  };

  const submit = async () => {
    const missing = (product.options || []).find((option) => option.is_required && !(selectedValues[option.id] || []).length);
    if (missing) {
      await Swal.fire("Choose an option", `${missing.name} is required.`, "warning");
      return;
    }

    const optionLabels = selectedOptions.flatMap((option) => option.values.map((value) => `${option.name}: ${value.name}`));
    const optionExtraPrices = selectedOptions.flatMap((option) => option.values.map((value) => Number(value.extra_price || 0)));
    const backendOptions = selectedOptions.map((option) => ({
      product_option_id: option.product_option_id,
      product_option_value_ids: option.values.map((value) => value.product_option_value_id),
    }));
    const key = cartItemKey(product.id, backendOptions);

    onAdd({
      key,
      product_id: product.id,
      id: product.id,
      name: product.name,
      image_path: product.image_path,
      base_price: Number(product.price || 0),
      discount_price: product.discount_price,
      quantity,
      selected_options: backendOptions,
      selected_option_labels: optionLabels,
      selected_option_extra_prices: optionExtraPrices,
      unit_price: liveUnitPrice,
      item_total: liveTotal,
      note: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 grid place-items-end bg-slate-950/55 p-3 sm:place-items-center">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        {imageUrl ? (
          <img className="h-44 w-full object-cover" src={imageUrl} alt={product.name} />
        ) : (
          <div className="grid h-28 place-items-center bg-slate-100 text-sm text-slate-400">No image</div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{product.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{product.description || "No description"}</p>
              <p className="mt-3 font-bold text-orange-700">{money(basePrice)} KHR</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700">Close</button>
          </div>

          <div className="mt-5 grid gap-4">
            {(product.options || []).map((option) => (
              <section key={option.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{option.name}</h3>
                  {option.is_required ? <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">Required</span> : null}
                </div>
                <div className="mt-3 grid gap-2">
                  {(option.values || []).map((value) => {
                    const checked = (selectedValues[option.id] || []).includes(value.id);
                    const inputType = option.type === "multiple" ? "checkbox" : "radio";
                    const onChange = option.type === "multiple"
                      ? () => toggleMultiple(option.id, value.id)
                      : () => setSingle(option.id, value.id);

                    return (
                      <label key={value.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <input type={inputType} name={`option-${option.id}`} checked={checked} onChange={onChange} />
                          <span className="font-medium text-slate-800">{value.name}</span>
                        </span>
                        <span className="text-slate-500">{Number(value.extra_price || 0) > 0 ? `+${money(value.extra_price)} KHR` : "Free"}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-md bg-slate-50 p-3">
            <span className="font-semibold text-slate-800">Quantity</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-9 w-9 rounded-md border border-slate-300">-</button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-9 w-9 rounded-md border border-slate-300">+</button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-950">{money(liveTotal)} KHR</p>
            </div>
            <button type="button" onClick={submit} className="rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSelectedOptions(product, selectedValues) {
  return (product.options || [])
    .map((option) => {
      const valueIds = selectedValues[option.id] || [];
      const values = (option.values || [])
        .filter((value) => valueIds.includes(value.id))
        .map((value) => ({
          product_option_value_id: value.id,
          name: value.name,
          extra_price: Number(value.extra_price || 0),
        }));

      return {
        product_option_id: option.id,
        name: option.name,
        type: option.type,
        values,
      };
    })
    .filter((option) => option.values.length > 0);
}
