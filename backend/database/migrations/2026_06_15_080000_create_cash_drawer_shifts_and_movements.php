<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_drawer_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('opened_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('shift_code')->unique();
            $table->decimal('opening_float', 12, 2)->default(0);
            $table->decimal('expected_cash_total', 12, 2)->default(0);
            $table->decimal('counted_cash_total', 12, 2)->nullable();
            $table->decimal('cash_difference', 12, 2)->nullable();
            $table->decimal('cash_in_total', 12, 2)->default(0);
            $table->decimal('cash_out_total', 12, 2)->default(0);
            $table->text('note')->nullable();
            $table->string('status')->default('open');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'status']);
            $table->index(['user_id', 'branch_id', 'status']);
        });

        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')->constrained('cash_drawer_shifts')->cascadeOnDelete();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->decimal('amount', 12, 2);
            $table->string('reason');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'type']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('cash_drawer_shift_id')->nullable()->after('confirmed_by')->constrained('cash_drawer_shifts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cash_drawer_shift_id');
        });

        Schema::dropIfExists('cash_movements');
        Schema::dropIfExists('cash_drawer_shifts');
    }
};
