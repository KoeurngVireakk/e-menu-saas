<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiningTableController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicMenuController;
use App\Http\Controllers\Api\PublicOrderController;
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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/system/health', [HealthController::class, 'index']);

    Route::apiResource('shops', ShopController::class);
    Route::get('/shops/{shop}/settings', [ShopSettingsController::class, 'show']);
    Route::post('/shops/{shop}/settings', [ShopSettingsController::class, 'update']);
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
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
    Route::put('/payments/{payment}/reject', [PaymentController::class, 'reject']);
});
