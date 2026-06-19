import { describe, expect, it } from "vitest";
import { queryKeys } from "./queryKeys";

describe("query keys", () => {
  it("matches the shared tenant-resource key contract", () => {
    expect(queryKeys.currentUser).toEqual(["auth", "me"]);
    expect(queryKeys.shops).toEqual(["shops"]);
    expect(queryKeys.shopBranches(3)).toEqual(["shops", 3, "branches"]);
    expect(queryKeys.shopCategories(3)).toEqual(["shops", 3, "categories"]);
    expect(queryKeys.shopProducts(3, { status: "active" }))
      .toEqual(["shops", 3, "products", { status: "active" }]);
  });

  it("drops empty filters and produces deterministic objects", () => {
    expect(queryKeys.payments({ status: "", shop_id: 2, branch_id: null }))
      .toEqual(["payments", { shop_id: 2 }]);
    expect(queryKeys.orders({ status: "paid", shop_id: 2 }))
      .toEqual(queryKeys.orders({ shop_id: 2, status: "paid" }));
  });
});
