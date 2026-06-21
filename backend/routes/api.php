<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BakongKhqrWebhookController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CashLedgerController;
use App\Http\Controllers\Api\DiningTableController;
use App\Http\Controllers\Api\ExpenseCategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\KitchenController;
use App\Http\Controllers\Api\KitchenStationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PrintController;
use App\Http\Controllers\Api\PrintStationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicMenuController;
use App\Http\Controllers\Api\PublicOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\ShopSettingsController;
use App\Http\Controllers\Api\ShopStaffController;
use App\Http\Controllers\Api\TranslationController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'public']);
Route::get('/health/live', [HealthController::class, 'live']);
Route::get('/health/ready', [HealthController::class, 'ready']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::prefix('public')->group(function () {
    Route::get('/shops/{slug}/menu', [PublicMenuController::class, 'menu'])->middleware('throttle:public-menu');
    Route::get('/shops/{slug}/products/{product}', [PublicMenuController::class, 'product'])->middleware('throttle:public-menu');
    Route::post('/orders', [PublicOrderController::class, 'store'])->middleware('throttle:public-orders');
    Route::get('/orders/{orderNumber}', [PublicOrderController::class, 'show'])->middleware('throttle:public-orders');
    Route::post('/orders/{orderNumber}/payment', [PublicOrderController::class, 'payment'])->middleware('throttle:payment-proof');
});

Route::post('/webhooks/bakong-khqr', BakongKhqrWebhookController::class)->middleware('throttle:webhooks');

Route::middleware(['auth:sanctum', 'throttle:admin-api'])->group(function () {
    Route::get('/account/profile', [AccountController::class, 'profile']);
    Route::put('/account/profile', [AccountController::class, 'updateProfile']);
    Route::put('/account/password', [AccountController::class, 'updatePassword']);
    Route::get('/account/preferences', [AccountController::class, 'preferences']);
    Route::put('/account/preferences', [AccountController::class, 'updatePreferences']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::get('/system/health', [HealthController::class, 'index']);

    Route::get('/reports/sales-summary', [ReportController::class, 'salesSummary']);
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/analytics', [ReportController::class, 'analyticsOverview']);
    Route::get('/reports/sales-trend', [ReportController::class, 'salesTrend']);
    Route::get('/reports/order-status', [ReportController::class, 'orderStatus']);
    Route::get('/reports/top-products', [ReportController::class, 'topProducts']);
    Route::get('/reports/branch-performance', [ReportController::class, 'branchPerformance']);
    Route::get('/reports/hourly-activity', [ReportController::class, 'hourlyActivity']);
    Route::get('/reports/export-summary', [ReportController::class, 'exportSummary']);
    Route::get('/reports/product-sales', [ReportController::class, 'productSales']);
    Route::get('/reports/payment-methods', [ReportController::class, 'paymentMethods']);
    Route::get('/reports/daily-closing', [ReportController::class, 'dailyClosing']);
    Route::post('/reports/daily-closing', [ReportController::class, 'storeDailyClosing']);

    Route::get('/expense-categories', [ExpenseCategoryController::class, 'index']);
    Route::post('/expense-categories', [ExpenseCategoryController::class, 'store']);
    Route::put('/expense-categories/{category}', [ExpenseCategoryController::class, 'update']);
    Route::delete('/expense-categories/{category}', [ExpenseCategoryController::class, 'destroy']);

    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
    Route::put('/expenses/{expense}/approve', [ExpenseController::class, 'approve']);
    Route::put('/expenses/{expense}/reject', [ExpenseController::class, 'reject']);
    Route::put('/expenses/{expense}/mark-paid', [ExpenseController::class, 'markPaid']);
    Route::put('/expenses/{expense}/cancel', [ExpenseController::class, 'cancel']);

    Route::get('/cash-ledger', [CashLedgerController::class, 'index']);
    Route::get('/cash-ledger/export', [CashLedgerController::class, 'export']);

    Route::get('/kitchen/orders', [KitchenController::class, 'index']);
    Route::get('/kitchen/orders/{order}', [KitchenController::class, 'show']);
    Route::put('/kitchen/orders/{order}/status', [KitchenController::class, 'updateOrderStatus']);
    Route::put('/kitchen/order-items/{orderItem}/status', [KitchenController::class, 'updateItemStatus']);
    Route::get('/kitchen/events', [KitchenController::class, 'events']);
    Route::get('/shops/{shop}/kitchen-stations', [KitchenStationController::class, 'index']);
    Route::post('/shops/{shop}/kitchen-stations', [KitchenStationController::class, 'store']);
    Route::put('/kitchen-stations/{station}', [KitchenStationController::class, 'update']);
    Route::delete('/kitchen-stations/{station}', [KitchenStationController::class, 'destroy']);

    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::post('/shifts/open', [ShiftController::class, 'open']);
    Route::get('/shifts/{shift}', [ShiftController::class, 'show']);
    Route::post('/shifts/{shift}/cash-movement', [ShiftController::class, 'cashMovement']);
    Route::post('/shifts/{shift}/close', [ShiftController::class, 'close']);
    Route::post('/shifts/{shift}/cancel', [ShiftController::class, 'cancel']);
    Route::get('/shifts/{shift}/report', [ShiftController::class, 'report']);

    Route::apiResource('shops', ShopController::class);
    Route::get('/shops/{shop}/settings', [ShopSettingsController::class, 'show']);
    Route::post('/shops/{shop}/settings', [ShopSettingsController::class, 'update']);
    Route::post('/shops/{shop}/notifications/test-telegram', [ShopSettingsController::class, 'testTelegram']);
    Route::get('/shops/{shop}/print-stations', [PrintStationController::class, 'index']);
    Route::post('/shops/{shop}/print-stations', [PrintStationController::class, 'store']);
    Route::get('/print-stations/{printStation}', [PrintStationController::class, 'show']);
    Route::put('/print-stations/{printStation}', [PrintStationController::class, 'update']);
    Route::delete('/print-stations/{printStation}', [PrintStationController::class, 'destroy']);
    Route::get('/shops/{shop}/translations', [TranslationController::class, 'shop']);
    Route::put('/shops/{shop}/translations', [TranslationController::class, 'updateShop']);
    Route::get('/shops/{shop}/staff', [ShopStaffController::class, 'index']);
    Route::post('/shops/{shop}/staff', [ShopStaffController::class, 'store']);
    Route::get('/shop-staff/{staff}', [ShopStaffController::class, 'show']);
    Route::put('/shop-staff/{staff}', [ShopStaffController::class, 'update']);
    Route::delete('/shop-staff/{staff}', [ShopStaffController::class, 'destroy']);
    Route::put('/shop-staff/{staff}/status', [ShopStaffController::class, 'updateStatus']);

    Route::get('/shops/{shop}/branches', [BranchController::class, 'index']);
    Route::post('/shops/{shop}/branches', [BranchController::class, 'store']);
    Route::get('/branches/{branch}', [BranchController::class, 'show']);
    Route::put('/branches/{branch}', [BranchController::class, 'update']);
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);

    Route::get('/shops/{shop}/categories', [CategoryController::class, 'index']);
    Route::post('/shops/{shop}/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::put('/categories/{category}/translations', [TranslationController::class, 'updateCategory']);

    Route::get('/shops/{shop}/products', [ProductController::class, 'index']);
    Route::post('/shops/{shop}/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::put('/products/{product}/translations', [TranslationController::class, 'updateProduct']);
    Route::put('/product-options/{option}/translations', [TranslationController::class, 'updateOption']);
    Route::put('/product-option-values/{value}/translations', [TranslationController::class, 'updateOptionValue']);

    Route::get('/branches/{branch}/tables', [DiningTableController::class, 'index']);
    Route::post('/branches/{branch}/tables', [DiningTableController::class, 'store']);
    Route::get('/tables/{table}', [DiningTableController::class, 'show']);
    Route::put('/tables/{table}', [DiningTableController::class, 'update']);
    Route::delete('/tables/{table}', [DiningTableController::class, 'destroy']);
    Route::get('/tables/{table}/qr', [DiningTableController::class, 'qr']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders/{order}/receipt', [OrderController::class, 'receipt']);
    Route::get('/orders/{order}/kitchen-ticket', [PrintController::class, 'kitchenTicket']);
    Route::get('/orders/{order}/receipt-print', [PrintController::class, 'receipt']);
    Route::post('/orders/{order}/invoice', [InvoiceController::class, 'store']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{invoice}/print', [PrintController::class, 'invoice']);
    Route::put('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
    Route::put('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
    Route::put('/payments/{payment}/reject', [PaymentController::class, 'reject']);
});
