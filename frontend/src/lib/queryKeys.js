function stableFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== "" && value !== null && value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export const queryKeys = {
  currentUser: ["auth", "me"],
  accountProfile: ["account", "profile"],
  accountPreferences: ["account", "preferences"],
  accountActivity: ["account", "activity"],
  notifications: (filters = {}) => ["notifications", stableFilters(filters)],
  notificationUnreadCount: ["notifications", "unread-count"],
  shops: ["shops"],
  shopBranches: (shopId) => ["shops", shopId, "branches"],
  shopCategories: (shopId) => ["shops", shopId, "categories"],
  shopProducts: (shopId, filters = {}) => ["shops", shopId, "products", stableFilters(filters)],
  branchTables: (branchId) => ["branches", branchId, "tables"],
  orders: (filters = {}) => ["orders", stableFilters(filters)],
  payments: (filters = {}) => ["payments", stableFilters(filters)],
};

export { stableFilters };
