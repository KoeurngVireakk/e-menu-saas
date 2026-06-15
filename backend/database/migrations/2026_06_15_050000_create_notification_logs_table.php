<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel')->default('telegram');
            $table->string('event');
            $table->string('recipient')->nullable();
            $table->string('status')->default('pending');
            $table->text('message_preview')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata_json')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'branch_id', 'channel', 'event']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
