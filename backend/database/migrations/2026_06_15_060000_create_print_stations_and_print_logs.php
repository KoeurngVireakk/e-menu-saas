<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('print_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type');
            $table->string('paper_size')->default('80mm');
            $table->boolean('is_default')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'type', 'status']);
        });

        Schema::create('print_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('printable_type');
            $table->unsignedBigInteger('printable_id');
            $table->string('print_type');
            $table->foreignId('print_station_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('generated');
            $table->json('metadata_json')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['shop_id', 'branch_id', 'print_type']);
            $table->index(['printable_type', 'printable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_logs');
        Schema::dropIfExists('print_stations');
    }
};
