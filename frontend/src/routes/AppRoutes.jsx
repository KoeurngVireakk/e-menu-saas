import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import PublicMenuLayout from "../layouts/PublicMenuLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/admin/Dashboard";
import ShopsPage from "../pages/admin/shops/ShopsPage";
import BranchesPage from "../pages/admin/branches/BranchesPage";
import CategoriesPage from "../pages/admin/categories/CategoriesPage";
import ProductsPage from "../pages/admin/products/ProductsPage";
import TablesPage from "../pages/admin/tables/TablesPage";
import OrdersPage from "../pages/admin/orders/OrdersPage";
import PaymentsPage from "../pages/admin/payments/PaymentsPage";
import MenuPage from "../pages/public/MenuPage";
import CartPage from "../pages/public/CartPage";
import OrderSuccess from "../pages/public/OrderSuccess";
import PaymentPage from "../pages/public/PaymentPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
      </Route>
      <Route element={<PublicMenuLayout />}>
        <Route path="/menu/:shopSlug" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/payment/:orderNumber" element={<PaymentPage />} />
      </Route>
    </Routes>
  );
}
