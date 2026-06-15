<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('payment_method');
            $table->string('provider_payment_id')->nullable()->after('provider');
            $table->string('provider_reference')->nullable()->after('provider_payment_id');
            $table->text('qr_payload')->nullable()->after('provider_reference');
            $table->string('qr_image_url')->nullable()->after('qr_payload');
            $table->timestamp('webhook_verified_at')->nullable()->after('qr_image_url');
            $table->string('failure_reason')->nullable()->after('webhook_verified_at');
            $table->timestamp('expires_at')->nullable()->after('failure_reason');

            $table->index(['provider', 'provider_reference']);
            $table->index(['provider', 'provider_payment_id']);
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['provider', 'provider_reference']);
            $table->dropIndex(['provider', 'provider_payment_id']);
            $table->dropColumn([
                'provider',
                'provider_payment_id',
                'provider_reference',
                'qr_payload',
                'qr_image_url',
                'webhook_verified_at',
                'failure_reason',
                'expires_at',
            ]);
        });
    }
};
