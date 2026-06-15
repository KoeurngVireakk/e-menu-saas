import { describe, expect, it } from "vitest";
import { cartItemKey, mergeCartItem } from "./cart";

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
});
