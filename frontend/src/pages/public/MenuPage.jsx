import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import CartDrawer from "../../components/CartDrawer";
import OfflineBanner from "../../components/OfflineBanner";
import ProductCard from "../../components/ProductCard";
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, SectionTitle, toastError, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { cartItemKey, itemTotal, mergeCartItem, money, productBasePrice, readCart, writeCart } from "../../utils/cart";
import { menuCacheKey, readMenuCache, writeMenuCache } from "../../utils/menuCache";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function MenuPage() {
  const { shopSlug } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(readCart);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [offlineCached, setOfflineCached] = useState(false);

  useEffect(() => {
    const cacheKey = menuCacheKey(shopSlug, search);

    api
      .get(`/public/shops/${shopSlug}/menu?${search}`)
      .then((response) => {
        const data = response.data.data;
        setMenu(data);
        setActive(data.categories[0]?.id || "");
        writeMenuCache(cacheKey, data);
        setOfflineCached(!online);
        setError("");
      })
      .catch((requestError) => {
        const cached = readMenuCache(cacheKey);

        if (!online && cached) {
          setMenu(cached.data);
          setActive(cached.data.categories[0]?.id || "");
          setOfflineCached(true);
          setError("");
          return;
        }

        setError(!online
          ? "You are offline and this menu has not been saved on this device yet."
          : requestError.response?.data?.message || "Menu is not available right now.");
      });
  }, [shopSlug, search, online]);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  const products = useMemo(() => {
    const category = menu?.categories?.find((item) => String(item.id) === String(active));
    return (category?.products || []).filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [menu, active, query]);

  const featuredProducts = useMemo(() => {
    if (!menu) return [];

    return menu.categories
      .flatMap((category) => category.products || [])
      .filter((product) => product.is_featured && product.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4);
  }, [menu, query]);

  const addConfiguredItem = (cartItem) => {
    setCart((items) => mergeCartItem(items, cartItem));
    toastSuccess(`${cartItem.name} added`);
  };

  if (error) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl bg-slate-50">
        {!online ? <OfflineBanner /> : null}
        <div className="p-4">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl bg-slate-50">
        {!online ? <OfflineBanner /> : null}
        <div className="p-4">
          <LoadingState message="Loading menu..." />
        </div>
      </div>
    );
  }

  const coverUrl = menu.shop.cover_path ? `${storageUrl}/${menu.shop.cover_path}` : null;
  const logoUrl = menu.shop.logo_path ? `${storageUrl}/${menu.shop.logo_path}` : null;
  const activeCategory = menu.categories.find((category) => String(category.id) === String(active));

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 pb-64">
      {!online ? <OfflineBanner cached={offlineCached} /> : null}
      <section className="relative overflow-hidden rounded-b-4xl bg-slate-950 text-white shadow-sm" style={{ backgroundColor: menu.shop.primary_color || "#0f172a" }}>
        {coverUrl ? <img className="absolute inset-0 h-full w-full object-cover opacity-35" src={coverUrl} alt={menu.shop.name} /> : null}
        <div className="relative px-4 pb-7 pt-10">
          <div className="flex items-end gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/20 bg-white/15 text-xl font-black backdrop-blur">
              {logoUrl ? <img className="h-full w-full object-cover" src={logoUrl} alt={menu.shop.name} /> : menu.shop.name?.slice(0, 2)}
            </div>
            <div className="min-w-0 pb-1">
              <Badge tone="orange">{menu.branch?.name || "Main branch"}</Badge>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight">{menu.shop.name}</h1>
              <p className="mt-1 text-sm text-white/75">{menu.table ? `${menu.table.table_name} · ` : ""}{menu.shop.description || "Fresh menu, ready to order."}</p>
            </div>
          </div>
          <Input
            aria-label="Search menu"
            className="mt-5 border-white/20 bg-white text-slate-950 placeholder:text-slate-400"
            placeholder="Search menu"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <div className="sticky top-0 z-10 mt-4 flex gap-2 overflow-x-auto bg-slate-50/95 px-4 py-3 backdrop-blur">
        {menu.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition ${
              String(active) === String(category.id) ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {featuredProducts.length ? (
        <section className="mt-2 px-4">
          <SectionTitle eyebrow="Featured" title="Popular right now" />
          <div className="mt-3 grid gap-3">
            {featuredProducts.map((product) => <ProductCard key={`featured-${product.id}`} product={product} onAdd={setSelected} onView={setSelected} />)}
          </div>
        </section>
      ) : null}

      <section className="mt-6 px-4">
        <SectionTitle eyebrow="Menu" title={activeCategory?.name || "Products"} />
      </section>
      <motion.div className="mt-3 grid gap-3 px-4" layout>
        {products.map((product) => <ProductCard key={product.id} product={product} onAdd={setSelected} onView={setSelected} />)}
        {!products.length ? <EmptyState title="No products found" message="Try another category or search term." /> : null}
      </motion.div>
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
    ? `${storageUrl}/${product.image_path}`
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
      toastError(`${missing.name} is required`);
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
    <Modal open onClose={onClose} className="rounded-2xl">
      <div>
        {imageUrl ? (
          <img className="h-52 w-full object-cover" src={imageUrl} alt={product.name} />
        ) : (
          <div className="grid h-36 place-items-center bg-slate-100 text-sm font-semibold text-slate-400">No image</div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black leading-tight text-slate-950">{product.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{product.description || "No description"}</p>
              <p className="mt-3 text-lg font-black text-orange-700">{money(basePrice)} KHR</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {(product.options || []).map((option) => (
              <section key={option.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{option.name}</h3>
                  {option.is_required ? <Badge tone="orange">Required</Badge> : <Badge>Optional</Badge>}
                </div>
                <div className="mt-3 grid gap-2">
                  {(option.values || []).map((value) => {
                    const checked = (selectedValues[option.id] || []).includes(value.id);
                    const inputType = option.type === "multiple" ? "checkbox" : "radio";
                    const onChange = option.type === "multiple"
                      ? () => toggleMultiple(option.id, value.id)
                      : () => setSingle(option.id, value.id);

                    return (
                      <label key={value.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm transition ${checked ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}>
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

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="font-semibold text-slate-800">Quantity</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</Button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <Button type="button" variant="secondary" size="icon" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>+</Button>
            </div>
          </div>

          <div className="sticky bottom-0 mt-4 flex items-center justify-between border-t border-slate-100 bg-white pt-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-950">{money(liveTotal)} KHR</p>
            </div>
            <Button type="button" onClick={submit} size="lg">
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </Modal>
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
