<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();

            $table->unique(['shop_id', 'locale']);
        });

        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->timestamps();

            $table->unique(['category_id', 'locale']);
        });

        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'locale']);
        });

        Schema::create('product_option_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_option_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->timestamps();

            $table->unique(['product_option_id', 'locale']);
        });

        Schema::create('product_option_value_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_option_value_id');
            $table->string('locale', 5);
            $table->string('name');
            $table->timestamps();

            $table->foreign('product_option_value_id', 'pov_translations_value_fk')
                ->references('id')
                ->on('product_option_values')
                ->cascadeOnDelete();
            $table->unique(['product_option_value_id', 'locale'], 'option_value_locale_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_option_value_translations');
        Schema::dropIfExists('product_option_translations');
        Schema::dropIfExists('product_translations');
        Schema::dropIfExists('category_translations');
        Schema::dropIfExists('shop_translations');
    }
};
