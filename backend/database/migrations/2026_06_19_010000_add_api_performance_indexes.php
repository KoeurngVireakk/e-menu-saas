<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->index(['shop_id', 'branch_id', 'order_status', 'payment_status', 'created_at'], 'orders_api_scope_status_created_idx');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->index(['shop_id', 'branch_id', 'status', 'payment_method', 'created_at'], 'payments_api_scope_status_created_idx');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->index(['shop_id', 'branch_id', 'category_id', 'status', 'is_available'], 'products_public_menu_idx');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->index(['shop_id', 'branch_id', 'status', 'sort_order'], 'categories_public_menu_idx');
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->index(['shop_id', 'status'], 'branches_shop_status_idx');
        });

        Schema::table('dining_tables', function (Blueprint $table): void {
            $table->index(['shop_id', 'branch_id', 'status'], 'dining_tables_scope_status_idx');
        });

        Schema::table('shop_staff', function (Blueprint $table): void {
            $table->index(['user_id', 'shop_id', 'branch_id', 'status'], 'shop_staff_user_scope_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('shop_staff', function (Blueprint $table): void {
            $table->dropIndex('shop_staff_user_scope_status_idx');
        });

        Schema::table('dining_tables', function (Blueprint $table): void {
            $table->dropIndex('dining_tables_scope_status_idx');
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropIndex('branches_shop_status_idx');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropIndex('categories_public_menu_idx');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex('products_public_menu_idx');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->dropIndex('payments_api_scope_status_created_idx');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex('orders_api_scope_status_created_idx');
        });
    }
};
