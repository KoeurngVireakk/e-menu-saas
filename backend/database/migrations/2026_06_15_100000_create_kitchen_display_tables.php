<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('kitchen_status')->default('pending')->after('selected_options_json');
            $table->timestamp('prepared_at')->nullable()->after('kitchen_status');
            $table->timestamp('served_at')->nullable()->after('prepared_at');
            $table->index('kitchen_status');
        });

        Schema::create('kitchen_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type');
            $table->json('metadata_json')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['shop_id', 'branch_id', 'event_type']);
            $table->index(['order_id', 'order_item_id']);
        });

        Schema::create('kitchen_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('general');
            $table->json('category_ids_json')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kitchen_stations');
        Schema::dropIfExists('kitchen_events');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['kitchen_status']);
            $table->dropColumn(['kitchen_status', 'prepared_at', 'served_at']);
        });
    }
};
