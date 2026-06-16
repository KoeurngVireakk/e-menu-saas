import { beforeEach, describe, expect, it } from "vitest";
import { cartItemKey, cartStorageKey, readCart, writeCart, mergeCartItem } from "./cart";

const large = [
  {
    product_option_id: 1,
    product_option_value_ids: [2],
  },
];

const largeWithShot = [
  {
    product_option_id: 2,
    product_option_value_ids: [9],
  },
  {
    product_option_id: 1,
    product_option_value_ids: [2],
  },
];

describe("cart utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps different option combinations separate", () => {
    expect(cartItemKey(10, large)).not.toBe(cartItemKey(10, largeWithShot));
  });

  it("normalizes option ordering for stable keys", () => {
    const reordered = [
      {
        product_option_id: 1,
        product_option_value_ids: [2],
      },
      {
        product_option_id: 2,
        product_option_value_ids: [9],
      },
    ];

    expect(cartItemKey(10, largeWithShot)).toBe(cartItemKey(10, reordered));
  });

  it("merges quantity for the same product and options", () => {
    const key = cartItemKey(10, large);
    const first = { key, product_id: 10, quantity: 1, unit_price: 10000 };
    const second = { key, product_id: 10, quantity: 2, unit_price: 10000 };

    expect(mergeCartItem([first], second)).toEqual([
      { ...first, quantity: 3, item_total: 30000 },
    ]);
  });

  it("persists carts by shop, branch, and table context", () => {
    const tableOne = { shopSlug: "cafe", branchId: 1, tableCode: "T01" };
    const tableTwo = { shopSlug: "cafe", branchId: 1, tableCode: "T02" };

    writeCart([{ key: "item-1", product_id: 1, quantity: 1, unit_price: 1000 }], tableOne);
    writeCart([{ key: "item-2", product_id: 2, quantity: 1, unit_price: 2000 }], tableTwo);

    expect(cartStorageKey(tableOne)).not.toBe(cartStorageKey(tableTwo));
    expect(readCart(tableOne)[0].product_id).toBe(1);
    expect(readCart(tableTwo)[0].product_id).toBe(2);
  });

  it("falls back to legacy cart storage when a scoped cart is not found", () => {
    localStorage.setItem("emenu_cart", JSON.stringify([
      { key: "legacy", product_id: 5, quantity: 1, unit_price: 3000 },
    ]));

    expect(readCart({ shopSlug: "new-cafe" })[0].product_id).toBe(5);
  });
});
