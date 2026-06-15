const allRoles = ["super_admin", "shop_owner", "manager", "cashier", "waiter"];

const featurePermissions = {
  dashboard: {
    view: allRoles,
  },
  shops: {
    view: ["super_admin", "shop_owner"],
    create: ["super_admin", "shop_owner"],
    update: ["super_admin", "shop_owner"],
    delete: ["super_admin", "shop_owner"],
  },
  branches: {
    view: ["super_admin", "shop_owner", "manager"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
  },
  categories: {
    view: ["super_admin", "shop_owner", "manager"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
  },
  products: {
    view: ["super_admin", "shop_owner", "manager"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
  },
  translations: {
    view: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
  },
  tables: {
    view: ["super_admin", "shop_owner", "manager", "waiter"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
  },
  orders: {
    view: ["super_admin", "shop_owner", "manager", "cashier", "waiter"],
    update: ["super_admin", "shop_owner", "manager", "cashier", "waiter"],
  },
  payments: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
  },
  invoices: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    create: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
  },
  staff: {
    view: ["super_admin", "shop_owner", "manager"],
    create: ["super_admin", "shop_owner"],
    update: ["super_admin", "shop_owner"],
    delete: ["super_admin", "shop_owner"],
  },
  settings: {
    view: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner"],
  },
  systemHealth: {
    view: ["super_admin", "shop_owner"],
  },
};

export function hasRole(user, roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user?.role);
}

export function canView(user, feature) {
  return hasPermission(user, feature, "view");
}

export function canCreate(user, feature) {
  return hasPermission(user, feature, "create");
}

export function canUpdate(user, feature) {
  return hasPermission(user, feature, "update");
}

export function canDelete(user, feature) {
  return hasPermission(user, feature, "delete");
}

export function canManagePayments(user) {
  return canUpdate(user, "payments");
}

export function canManageInvoices(user) {
  return canUpdate(user, "invoices");
}

export function canManageOrders(user) {
  return canUpdate(user, "orders");
}

export function canManageProducts(user) {
  return canUpdate(user, "products");
}

export function canManageShopSettings(user) {
  return canUpdate(user, "shops");
}

export function canManageTranslations(user) {
  return canUpdate(user, "translations");
}

export function canViewSystemHealth(user) {
  return canView(user, "systemHealth");
}

export function canViewStaff(user) {
  return canView(user, "staff");
}

export function canManageStaff(user) {
  return canCreate(user, "staff") && canUpdate(user, "staff") && canDelete(user, "staff");
}

export function canViewTenantSettings(user) {
  return canView(user, "settings");
}

export function canManageTenantSettings(user) {
  return canUpdate(user, "settings");
}

function hasPermission(user, feature, action) {
  if (!user?.role) {
    return false;
  }

  if (user.role === "super_admin") {
    return true;
  }

  const permissions = featurePermissions[feature];
  if (!permissions) {
    return false;
  }

  return hasRole(user, permissions[action] || []);
}
