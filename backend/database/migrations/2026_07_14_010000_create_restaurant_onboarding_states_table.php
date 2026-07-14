<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_onboarding_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shop_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('current_step')->default('shop_profile');
            $table->json('completed_steps_json')->nullable();
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_resumed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'shop_id']);
            $table->index(['shop_id', 'is_dismissed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_onboarding_states');
    }
};
