<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_closings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->date('closing_date');
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('currency_code', 3);
            $table->decimal('expected_cash_total', 12, 2)->default(0);
            $table->decimal('counted_cash_total', 12, 2)->nullable();
            $table->decimal('cash_difference', 12, 2)->nullable();
            $table->json('payment_totals_json')->nullable();
            $table->json('sales_summary_json')->nullable();
            $table->text('note')->nullable();
            $table->string('status')->default('closed');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->unique(['shop_id', 'branch_id', 'closing_date']);
            $table->index(['shop_id', 'branch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_closings');
    }
};
