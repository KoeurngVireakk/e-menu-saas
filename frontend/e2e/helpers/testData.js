export const owner = { id: 1, name: "E2E Owner", email: "e2e-owner@menudigi.test", role: "shop_owner" };

export const menu = {
  shop: { id: 1, name: "MenuDIGI E2E Cafe", slug: "menudigi-e2e-cafe", status: "active", description: "Deterministic browser test cafe" },
  branch: { id: 1, name: "Main E2E Branch" },
  table: { id: 1, table_name: "Table E01", table_code: "E01" },
  categories: [{ id: 1, name: "Coffee", products: [{ id: 1, name: "E2E Latte", description: "Test product", price: 10000, is_available: true, options: [] }] }],
};
