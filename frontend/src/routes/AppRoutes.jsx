import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import PublicMenuLayout from "../layouts/PublicMenuLayout";
import { LoadingState } from "../components/ui/States";
import PermissionRoute from "./PermissionRoute";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));
const DemoEntryPage = lazy(() => import("../pages/demo/DemoEntryPage"));
const DemoOrderStatusPage = lazy(() => import("../pages/demo/DemoOrderStatusPage"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ShopsPage = lazy(() => import("../pages/admin/shops/ShopsPage"));
const BranchesPage = lazy(() => import("../pages/admin/branches/BranchesPage"));
const CategoriesPage = lazy(() => import("../pages/admin/categories/CategoriesPage"));
const ProductsPage = lazy(() => import("../pages/admin/products/ProductsPage"));
const TranslationsPage = lazy(() => import("../pages/admin/translations/TranslationsPage"));
const TablesPage = lazy(() => import("../pages/admin/tables/TablesPage"));
const OrdersPage = lazy(() => import("../pages/admin/orders/OrdersPage"));
const KitchenPage = lazy(() => import("../pages/admin/kitchen/KitchenPage"));
const PaymentsPage = lazy(() => import("../pages/admin/payments/PaymentsPage"));
const ReviewsPage = lazy(() => import("../pages/admin/reviews/ReviewsPage"));
const InvoicesPage = lazy(() => import("../pages/admin/invoices/InvoicesPage"));
const ReportsPage = lazy(() => import("../pages/admin/reports/ReportsPage"));
const DailyClosingPage = lazy(() => import("../pages/admin/reports/DailyClosingPage"));
const ShiftsPage = lazy(() => import("../pages/admin/shifts/ShiftsPage"));
const ExpensesPage = lazy(() => import("../pages/admin/expenses/ExpensesPage"));
const CashLedgerPage = lazy(() => import("../pages/admin/cash-ledger/CashLedgerPage"));
const PrintStationsPage = lazy(() => import("../pages/admin/print-stations/PrintStationsPage"));
const StaffPage = lazy(() => import("../pages/admin/staff/StaffPage"));
const SettingsPage = lazy(() => import("../pages/admin/settings/SettingsPage"));
const SystemHealthPage = lazy(() => import("../pages/admin/SystemHealthPage"));
const ProfilePage = lazy(() => import("../pages/admin/account/ProfilePage"));
const NotificationsPage = lazy(() => import("../pages/admin/notifications/NotificationsPage"));
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<DemoEntryPage />} />
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
            <Route path="kitchen" element={<PermissionRoute feature="kitchen"><KitchenPage /></PermissionRoute>} />
            <Route path="payments" element={<PermissionRoute feature="payments"><PaymentsPage /></PermissionRoute>} />
            <Route path="reviews" element={<PermissionRoute feature="reviews"><ReviewsPage /></PermissionRoute>} />
            <Route path="invoices" element={<PermissionRoute feature="invoices"><InvoicesPage /></PermissionRoute>} />
            <Route path="reports" element={<PermissionRoute feature="reports"><ReportsPage /></PermissionRoute>} />
            <Route path="daily-closing" element={<PermissionRoute feature="dailyClosing"><DailyClosingPage /></PermissionRoute>} />
            <Route path="shifts" element={<PermissionRoute feature="shifts"><ShiftsPage /></PermissionRoute>} />
            <Route path="expenses" element={<PermissionRoute feature="expenses"><ExpensesPage /></PermissionRoute>} />
            <Route path="cash-ledger" element={<PermissionRoute feature="cashLedger"><CashLedgerPage /></PermissionRoute>} />
            <Route path="print-stations" element={<PermissionRoute feature="printStations"><PrintStationsPage /></PermissionRoute>} />
            <Route path="staff" element={<PermissionRoute feature="staff"><StaffPage /></PermissionRoute>} />
            <Route path="settings" element={<PermissionRoute feature="settings"><SettingsPage /></PermissionRoute>} />
            <Route path="system-health" element={<PermissionRoute feature="systemHealth"><SystemHealthPage /></PermissionRoute>} />
            <Route path="account/profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
        <Route element={<PublicMenuLayout />}>
          <Route path="/menu/:shopSlug" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="/payment/:orderNumber" element={<PaymentPage />} />
          <Route path="/demo/order-status" element={<DemoOrderStatusPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
