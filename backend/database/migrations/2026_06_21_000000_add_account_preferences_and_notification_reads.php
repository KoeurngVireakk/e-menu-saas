<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'preferences_json')) {
            Schema::table('users', function (Blueprint $table) {
                $table->json('preferences_json')->nullable()->after('status');
            });
        }

        if (! Schema::hasTable('notification_log_reads')) {
            Schema::create('notification_log_reads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('notification_log_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamp('read_at');
                $table->timestamps();

                $table->unique(['notification_log_id', 'user_id']);
                $table->index(['user_id', 'read_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_log_reads');

        if (Schema::hasColumn('users', 'preferences_json')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('preferences_json');
            });
        }
    }
};
