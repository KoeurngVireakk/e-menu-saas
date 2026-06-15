<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['shop_id', 'name']);
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('expense_number')->unique();
            $table->string('vendor_name')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency_code', 3)->default('KHR');
            $table->string('payment_method')->default('cash');
            $table->date('expense_date');
            $table->text('note')->nullable();
            $table->string('receipt_image_path')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'status']);
            $table->index(['expense_date', 'payment_method']);
        });

        Schema::create('cash_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('cash_drawer_shifts')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('entry_type');
            $table->string('direction');
            $table->decimal('amount', 12, 2);
            $table->string('currency_code', 3)->default('KHR');
            $table->text('description')->nullable();
            $table->date('entry_date');
            $table->json('metadata_json')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'entry_date']);
            $table->index(['entry_type', 'direction']);
            $table->unique(['source_type', 'source_id', 'entry_type'], 'cash_ledger_source_entry_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_ledger_entries');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
