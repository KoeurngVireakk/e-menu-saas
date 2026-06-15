<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BakongKhqrWebhookController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiningTableController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InvoiceController;
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

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API connection successful',
        'data' => [
            'status' => 'ok',
            'app' => config('app.name'),
        ],
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::prefix('public')->group(function () {
    Route::get('/shops/{slug}/menu', [PublicMenuController::class, 'menu']);
    Route::get('/shops/{slug}/products/{product}', [PublicMenuController::class, 'product']);
    Route::post('/orders', [PublicOrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [PublicOrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/payment', [PublicOrderController::class, 'payment']);
});

Route::post('/webhooks/bakong-khqr', BakongKhqrWebhookController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/system/health', [HealthController::class, 'index']);

    Route::get('/reports/sales-summary', [ReportController::class, 'salesSummary']);
    Route::get('/reports/product-sales', [ReportController::class, 'productSales']);
    Route::get('/reports/payment-methods', [ReportController::class, 'paymentMethods']);
    Route::get('/reports/daily-closing', [ReportController::class, 'dailyClosing']);
    Route::post('/reports/daily-closing', [ReportController::class, 'storeDailyClosing']);

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
