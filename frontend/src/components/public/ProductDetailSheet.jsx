import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { AppBadge, AppButton } from "../../design-system/components";
import { cartItemKey, money, productBasePrice } from "../../utils/cart";
import { t } from "../../utils/localization";
import { Modal, Textarea } from "../ui";

const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function ProductDetailSheet({ product, locale, open, onClose, onAdd, onValidationError }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedValues, setSelectedValues] = useState({});
  const imageUrl = product?.image_path ? `${storageUrl}/${product.image_path}` : null;
  const available = product?.is_available !== false;

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

  if (!product) return null;

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

  const submit = () => {
    const missing = (product.options || []).find((option) => option.is_required && !(selectedValues[option.id] || []).length);
    if (missing) {
      onValidationError?.(`${missing.name} ${t(locale, "isRequired")}`);
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
      note,
    });
    setQuantity(1);
    setNote("");
    setSelectedValues({});
    onClose();
  };

  return (
    <Modal open={open} title={product.name} onClose={onClose} className="overflow-hidden rounded-t-3xl sm:rounded-3xl">
      <div>
        {imageUrl ? (
          <img className="h-64 w-full object-cover" src={imageUrl} alt={product.name} />
        ) : (
          <div className="grid h-48 place-items-center bg-slate-100 text-sm font-semibold text-slate-400">{t(locale, "noImage")}</div>
        )}
        <div className="grid gap-5 p-4">
          <div>
            <div className="flex flex-wrap gap-2">
              {product.is_featured ? <AppBadge status="warning">Featured</AppBadge> : null}
              {!available ? <AppBadge status="danger">Sold out</AppBadge> : null}
              {product.preparation_time ? <AppBadge status="info">{product.preparation_time} min</AppBadge> : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{product.description || t(locale, "noDescription")}</p>
            <div className="mt-4">
              {product.discount_price ? <p className="text-sm text-slate-400 line-through">{money(product.price)} KHR</p> : null}
              <p className="text-2xl font-black text-blue-700">{money(basePrice)} KHR</p>
            </div>
          </div>

          {(product.options || []).map((option) => (
            <section key={option.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-slate-950">{option.name}</h3>
                {option.is_required ? <AppBadge status="warning">{t(locale, "required")}</AppBadge> : <AppBadge status="info">{t(locale, "optional")}</AppBadge>}
              </div>
              <div className="mt-3 grid gap-2">
                {(option.values || []).map((value) => {
                  const checked = (selectedValues[option.id] || []).includes(value.id);
                  const inputType = option.type === "multiple" ? "checkbox" : "radio";
                  const onChange = option.type === "multiple"
                    ? () => toggleMultiple(option.id, value.id)
                    : () => setSingle(option.id, value.id);

                  return (
                    <label key={value.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm transition ${checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                      <span className="flex items-center gap-2">
                        <input type={inputType} name={`option-${option.id}`} checked={checked} onChange={onChange} />
                        <span className="font-semibold text-slate-800">{value.name}</span>
                      </span>
                      <span className="text-slate-500">{Number(value.extra_price || 0) > 0 ? `+${money(value.extra_price)} KHR` : t(locale, "free")}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          <Textarea label="Special instructions" placeholder="Less sugar, no spicy, extra ice..." value={note} onChange={(event) => setNote(event.target.value)} />

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="font-black text-slate-800">{t(locale, "quantity")}</span>
            <div className="flex items-center gap-2">
              <AppButton type="button" variant="secondary" size="sm" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></AppButton>
              <span className="w-8 text-center font-black">{quantity}</span>
              <AppButton type="button" variant="secondary" size="sm" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus className="h-4 w-4" /></AppButton>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center justify-between border-t border-slate-100 bg-white p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">{t(locale, "total")}</p>
              <p className="text-xl font-black text-slate-950">{money(liveTotal)} KHR</p>
            </div>
            <AppButton type="button" disabled={!available} iconLeft={<ShoppingCart className="h-4 w-4" />} onClick={submit}>
              {available ? t(locale, "addToCart") : "Sold out"}
            </AppButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function buildSelectedOptions(product, selectedValues) {
  return (product?.options || [])
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
