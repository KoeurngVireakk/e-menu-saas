import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import PublicMenuLayout from "../layouts/PublicMenuLayout";
import { LoadingState } from "../components/ui/States";
import PermissionRoute from "./PermissionRoute";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ShopsPage = lazy(() => import("../pages/admin/shops/ShopsPage"));
const BranchesPage = lazy(() => import("../pages/admin/branches/BranchesPage"));
const CategoriesPage = lazy(() => import("../pages/admin/categories/CategoriesPage"));
const ProductsPage = lazy(() => import("../pages/admin/products/ProductsPage"));
const TranslationsPage = lazy(() => import("../pages/admin/translations/TranslationsPage"));
const TablesPage = lazy(() => import("../pages/admin/tables/TablesPage"));
const OrdersPage = lazy(() => import("../pages/admin/orders/OrdersPage"));
const PaymentsPage = lazy(() => import("../pages/admin/payments/PaymentsPage"));
const InvoicesPage = lazy(() => import("../pages/admin/invoices/InvoicesPage"));
const StaffPage = lazy(() => import("../pages/admin/staff/StaffPage"));
const SettingsPage = lazy(() => import("../pages/admin/settings/SettingsPage"));
const SystemHealthPage = lazy(() => import("../pages/admin/SystemHealthPage"));
const MenuPage = lazy(() => import("../pages/public/MenuPage"));
const CartPage = lazy(() => import("../pages/public/CartPage"));
const OrderSuccess = lazy(() => import("../pages/public/OrderSuccess"));
const PaymentPage = lazy(() => import("../pages/public/PaymentPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl">
        <LoadingState message="Loading page..." />
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="shops" element={<PermissionRoute feature="shops"><ShopsPage /></PermissionRoute>} />
            <Route path="branches" element={<PermissionRoute feature="branches"><BranchesPage /></PermissionRoute>} />
            <Route path="categories" element={<PermissionRoute feature="categories"><CategoriesPage /></PermissionRoute>} />
            <Route path="products" element={<PermissionRoute feature="products"><ProductsPage /></PermissionRoute>} />
            <Route path="translations" element={<PermissionRoute feature="translations"><TranslationsPage /></PermissionRoute>} />
            <Route path="tables" element={<PermissionRoute feature="tables"><TablesPage /></PermissionRoute>} />
            <Route path="orders" element={<PermissionRoute feature="orders"><OrdersPage /></PermissionRoute>} />
            <Route path="payments" element={<PermissionRoute feature="payments"><PaymentsPage /></PermissionRoute>} />
            <Route path="invoices" element={<PermissionRoute feature="invoices"><InvoicesPage /></PermissionRoute>} />
            <Route path="staff" element={<PermissionRoute feature="staff"><StaffPage /></PermissionRoute>} />
            <Route path="settings" element={<PermissionRoute feature="settings"><SettingsPage /></PermissionRoute>} />
            <Route path="system-health" element={<PermissionRoute feature="systemHealth"><SystemHealthPage /></PermissionRoute>} />
          </Route>
        </Route>
        <Route element={<PublicMenuLayout />}>
          <Route path="/menu/:shopSlug" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="/payment/:orderNumber" element={<PaymentPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
