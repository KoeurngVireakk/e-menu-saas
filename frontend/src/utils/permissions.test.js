import { describe, expect, it } from "vitest";
import {
  canCreate,
  canDelete,
  canManageInvoices,
  canManagePayments,
  canManageProducts,
  canManageShopSettings,
  canManageStaff,
  canManageTenantSettings,
  canManageTranslations,
  canUpdate,
  canView,
  canViewStaff,
  canViewSystemHealth,
  canViewTenantSettings,
  hasRole,
} from "./permissions";

describe("permissions", () => {
  it("grants super admin full access", () => {
    const user = { role: "super_admin" };

    expect(canView(user, "systemHealth")).toBe(true);
    expect(canCreate(user, "products")).toBe(true);
    expect(canDelete(user, "shops")).toBe(true);
  });

  it("limits shop settings and system health to owners and super admins", () => {
    expect(canManageShopSettings({ role: "shop_owner" })).toBe(true);
    expect(canManageTenantSettings({ role: "shop_owner" })).toBe(true);
    expect(canViewTenantSettings({ role: "shop_owner" })).toBe(true);
    expect(canViewSystemHealth({ role: "shop_owner" })).toBe(true);
    expect(canManageShopSettings({ role: "manager" })).toBe(false);
    expect(canManageTenantSettings({ role: "manager" })).toBe(false);
    expect(canViewTenantSettings({ role: "manager" })).toBe(true);
    expect(canViewSystemHealth({ role: "manager" })).toBe(false);
  });

  it("allows managers to manage catalog but not shop settings", () => {
    const user = { role: "manager" };

    expect(canManageProducts(user)).toBe(true);
    expect(canManageInvoices(user)).toBe(true);
    expect(canManageTranslations(user)).toBe(true);
    expect(canViewStaff(user)).toBe(true);
    expect(canManageStaff(user)).toBe(false);
    expect(canCreate(user, "categories")).toBe(true);
    expect(canUpdate(user, "branches")).toBe(true);
    expect(canManageShopSettings(user)).toBe(false);
  });

  it("allows cashiers to manage payments but not products", () => {
    const user = { role: "cashier" };

    expect(canManagePayments(user)).toBe(true);
    expect(canManageInvoices(user)).toBe(true);
    expect(canView(user, "orders")).toBe(true);
    expect(canView(user, "products")).toBe(false);
    expect(canView(user, "translations")).toBe(false);
    expect(canManageTranslations(user)).toBe(false);
    expect(canDelete(user, "products")).toBe(false);
  });

  it("allows waiters to view orders and tables only", () => {
    const user = { role: "waiter" };

    expect(canView(user, "orders")).toBe(true);
    expect(canView(user, "tables")).toBe(true);
    expect(canCreate(user, "tables")).toBe(false);
    expect(canView(user, "payments")).toBe(false);
    expect(canView(user, "invoices")).toBe(false);
    expect(canManageInvoices(user)).toBe(false);
  });

  it("denies unknown users", () => {
    expect(hasRole({ role: "cashier" }, ["cashier", "manager"])).toBe(true);
    expect(canView({ role: "unknown" }, "orders")).toBe(false);
    expect(canView(null, "orders")).toBe(false);
  });
});
