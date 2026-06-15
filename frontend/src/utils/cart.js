const CART_KEY = "emenu_cart";

export function money(value) {
  return Number(value || 0).toLocaleString();
}

export function productBasePrice(product) {
  return Number(product?.discount_price ?? product?.price ?? 0);
}

export function optionTotal(selectedOptions = []) {
  return selectedOptions.reduce((sum, option) => (
    sum + (option.values || []).reduce((valueSum, value) => valueSum + Number(value.extra_price || 0), 0)
  ), 0);
}

export function unitPrice(item) {
  return Number(item.unit_price ?? productBasePrice(item) + optionTotal(item.selected_options));
}

export function itemTotal(item) {
  return unitPrice(item) * Number(item.quantity || 0);
}

export function cartTotal(cart = []) {
  return cart.reduce((sum, item) => sum + itemTotal(item), 0);
}

export function optionSummary(item) {
  const labels = item.selected_option_labels || [];
  return labels.length ? labels.join(", ") : "";
}

export function cartItemKey(productId, selectedOptions = []) {
  const normalized = selectedOptions
    .map((option) => ({
      product_option_id: Number(option.product_option_id),
      product_option_value_ids: (option.product_option_value_ids || [])
        .map(Number)
        .sort((a, b) => a - b),
    }))
    .sort((a, b) => a.product_option_id - b.product_option_id);

  return `${productId}:${JSON.stringify(normalized)}`;
}

export function mergeCartItem(items = [], cartItem) {
  const existing = items.find((item) => item.key === cartItem.key);

  if (!existing) {
    return [...items, cartItem];
  }

  return items.map((item) => {
    if (item.key !== cartItem.key) {
      return item;
    }

    const quantity = Number(item.quantity || 0) + Number(cartItem.quantity || 0);
    return { ...item, quantity, item_total: itemTotal({ ...item, quantity }) };
  });
}

export function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && item.product_id && Number(item.quantity) > 0)
      .map((item) => {
        const selectedOptions = Array.isArray(item.selected_options) ? item.selected_options : [];
        const key = item.key || cartItemKey(item.product_id, selectedOptions);

        return {
          ...item,
          key,
          quantity: Number(item.quantity || 1),
          selected_options: selectedOptions,
          unit_price: Number(item.unit_price ?? productBasePrice(item) + optionTotal(selectedOptions)),
        };
      });
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
