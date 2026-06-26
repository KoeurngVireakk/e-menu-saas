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
  reviews: {
    view: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
  },
  invoices: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    create: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
  },
  printStations: {
    view: ["super_admin", "shop_owner", "manager", "cashier", "waiter"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
  },
  reports: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    export: ["super_admin", "shop_owner", "manager"],
  },
  dailyClosing: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    create: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
  },
  shifts: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    create: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
    manage: ["super_admin", "shop_owner", "manager"],
  },
  expenses: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    create: ["super_admin", "shop_owner", "manager", "cashier"],
    update: ["super_admin", "shop_owner", "manager", "cashier"],
    approve: ["super_admin", "shop_owner", "manager"],
  },
  cashLedger: {
    view: ["super_admin", "shop_owner", "manager", "cashier"],
    export: ["super_admin", "shop_owner", "manager"],
  },
  kitchen: {
    view: ["super_admin", "shop_owner", "manager", "cashier", "waiter"],
    update: ["super_admin", "shop_owner", "manager", "cashier", "waiter"],
    manage: ["super_admin", "shop_owner", "manager"],
  },
  kitchenStations: {
    view: ["super_admin", "shop_owner", "manager"],
    create: ["super_admin", "shop_owner", "manager"],
    update: ["super_admin", "shop_owner", "manager"],
    delete: ["super_admin", "shop_owner", "manager"],
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

export function canViewReviews(user) {
  return canView(user, "reviews");
}

export function canManageReviews(user) {
  return canUpdate(user, "reviews");
}

export function canManageInvoices(user) {
  return canUpdate(user, "invoices");
}

export function canViewPrintStations(user) {
  return canView(user, "printStations");
}

export function canManagePrintStations(user) {
  return canCreate(user, "printStations") && canUpdate(user, "printStations") && canDelete(user, "printStations");
}

export function canPrintKitchenTicket(user) {
  return hasRole(user, ["super_admin", "shop_owner", "manager", "waiter"]);
}

export function canPrintReceipt(user) {
  return hasRole(user, ["super_admin", "shop_owner", "manager", "cashier"]);
}

export function canViewReports(user) {
  return canView(user, "reports");
}

export function canManageDailyClosing(user) {
  return canCreate(user, "dailyClosing") && canUpdate(user, "dailyClosing");
}

export function canExportReports(user) {
  return hasPermission(user, "reports", "export");
}

export function canViewShifts(user) {
  return canView(user, "shifts");
}

export function canOpenShift(user) {
  return canCreate(user, "shifts");
}

export function canManageShift(user) {
  return hasPermission(user, "shifts", "manage");
}

export function canCloseShift(user) {
  return canUpdate(user, "shifts");
}

export function canAddCashMovement(user) {
  return canUpdate(user, "shifts");
}

export function canViewExpenses(user) {
  return canView(user, "expenses");
}

export function canManageExpenses(user) {
  return canCreate(user, "expenses") && canUpdate(user, "expenses");
}

export function canApproveExpenses(user) {
  return hasPermission(user, "expenses", "approve");
}

export function canViewCashLedger(user) {
  return canView(user, "cashLedger");
}

export function canExportCashLedger(user) {
  return hasPermission(user, "cashLedger", "export");
}

export function canViewKitchen(user) {
  return canView(user, "kitchen");
}

export function canManageKitchen(user) {
  return hasPermission(user, "kitchen", "manage");
}

export function canUpdateKitchenOrder(user) {
  return canUpdate(user, "kitchen");
}

export function canManageKitchenStations(user) {
  return canCreate(user, "kitchenStations") && canUpdate(user, "kitchenStations") && canDelete(user, "kitchenStations");
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
