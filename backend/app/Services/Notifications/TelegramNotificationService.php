<?php

namespace App\Services\Notifications;

use App\Models\Invoice;
use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shop;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TelegramNotificationService
{
    public function notifyOrderCreated(Order $order): NotificationLog
    {
        $order->loadMissing(['items', 'shop.settings', 'branch', 'diningTable']);

        return $this->notify(
            shop: $order->shop,
            branchId: $order->branch_id,
            event: 'order.created',
            message: implode("\n", [
                "New order: {$order->order_number}",
                "Shop: {$order->shop->name}",
                "Branch: {$order->branch?->name}",
                'Table/Type: '.($order->diningTable?->table_name ?: $order->order_type),
                'Items: '.$this->itemsSummary($order),
                'Total: '.$this->money($order->grand_total, $order->currency_code),
                "Payment: {$order->payment_status}",
                'Admin: '.$this->adminUrl('/admin/orders'),
            ]),
            metadata: ['order_id' => $order->id, 'order_number' => $order->order_number],
        );
    }

    public function notifyPaymentProofUploaded(Payment $payment): NotificationLog
    {
        $payment->loadMissing(['order', 'shop.settings', 'branch']);

        return $this->notify(
            shop: $payment->shop,
            branchId: $payment->branch_id,
            event: 'payment.proof_uploaded',
            message: implode("\n", [
                'Manual KHQR proof uploaded',
                "Order: {$payment->order->order_number}",
                'Amount: '.$this->money($payment->amount, $payment->currency_code),
                "Method: {$payment->payment_method}",
                "Status: {$payment->status}",
                'Admin: '.$this->adminUrl('/admin/payments'),
            ]),
            metadata: ['payment_id' => $payment->id, 'order_id' => $payment->order_id],
        );
    }

    public function notifyPaymentPaid(Payment $payment): NotificationLog
    {
        $payment->loadMissing(['order', 'shop.settings', 'branch']);

        return $this->notify(
            shop: $payment->shop,
            branchId: $payment->branch_id,
            event: 'payment.paid',
            message: implode("\n", [
                'Payment paid',
                "Order: {$payment->order->order_number}",
                'Amount: '.$this->money($payment->amount, $payment->currency_code),
                'Provider: '.($payment->provider ?: 'manual'),
                'Reference: '.($payment->provider_reference ?: $payment->transaction_reference ?: '-'),
                "Status: {$payment->status}",
            ]),
            metadata: ['payment_id' => $payment->id, 'order_id' => $payment->order_id],
        );
    }

    public function notifyPaymentFailed(Payment $payment, ?string $reason = null): NotificationLog
    {
        $payment->loadMissing(['order', 'shop.settings', 'branch']);

        return $this->notify(
            shop: $payment->shop,
            branchId: $payment->branch_id,
            event: 'payment.failed',
            message: implode("\n", [
                'Payment failed/rejected',
                "Order: {$payment->order->order_number}",
                'Amount: '.$this->money($payment->amount, $payment->currency_code),
                'Reason: '.($reason ?: $payment->failure_reason ?: '-'),
            ]),
            metadata: ['payment_id' => $payment->id, 'order_id' => $payment->order_id],
        );
    }

    public function notifyInvoicePaid(Invoice $invoice): NotificationLog
    {
        $invoice->loadMissing(['order', 'shop.settings', 'branch']);

        return $this->notify(
            shop: $invoice->shop,
            branchId: $invoice->branch_id,
            event: 'invoice.paid',
            message: implode("\n", [
                'Invoice paid',
                "Invoice: {$invoice->invoice_number}",
                "Order: {$invoice->order?->order_number}",
                'Amount: '.$this->money($invoice->paid_amount, $invoice->currency_code),
                'Paid at: '.($invoice->paid_at?->toDateTimeString() ?: now()->toDateTimeString()),
            ]),
            metadata: ['invoice_id' => $invoice->id, 'order_id' => $invoice->order_id],
        );
    }

    public function sendTest(Shop $shop): NotificationLog
    {
        $shop->loadMissing('settings');

        return $this->notify(
            shop: $shop,
            branchId: null,
            event: 'telegram.test',
            message: implode("\n", [
                'Telegram test notification',
                "Shop: {$shop->name}",
                'Sent at: '.now()->toDateTimeString(),
            ]),
            metadata: ['test' => true],
            bypassEventToggle: true,
        );
    }

    public function settings(Shop $shop): array
    {
        $settings = $shop->settings()->pluck('value', 'key');

        return [
            'telegram_enabled' => filter_var($settings->get('telegram_enabled', false), FILTER_VALIDATE_BOOLEAN),
            'telegram_chat_id' => $settings->get('telegram_chat_id'),
            'telegram_order_notifications' => filter_var($settings->get('telegram_order_notifications', false), FILTER_VALIDATE_BOOLEAN),
            'telegram_payment_notifications' => filter_var($settings->get('telegram_payment_notifications', false), FILTER_VALIDATE_BOOLEAN),
            'telegram_invoice_notifications' => filter_var($settings->get('telegram_invoice_notifications', false), FILTER_VALIDATE_BOOLEAN),
        ];
    }

    private function notify(
        Shop $shop,
        ?int $branchId,
        string $event,
        string $message,
        array $metadata = [],
        bool $bypassEventToggle = false,
    ): NotificationLog {
        $settings = $this->settings($shop);
        $recipient = $settings['telegram_chat_id'];
        $preview = str($message)->limit(1000, '')->toString();
        $skipReason = $this->skipReason($settings, $event, $bypassEventToggle);

        if ($skipReason) {
            return $this->log($shop, $branchId, $event, $recipient, 'skipped', $preview, $skipReason, $metadata);
        }

        if (config('telegram.sandbox_mode')) {
            return $this->log($shop, $branchId, $event, $recipient, 'sent', $preview, null, $metadata + ['sandbox' => true]);
        }

        try {
            $token = config('telegram.bot_token');
            $url = rtrim((string) config('telegram.api_url'), '/')."/bot{$token}/sendMessage";
            $response = Http::timeout(8)->post($url, [
                'chat_id' => $recipient,
                'text' => $message,
            ]);

            if ($response->successful()) {
                return $this->log($shop, $branchId, $event, $recipient, 'sent', $preview, null, $metadata);
            }

            return $this->log($shop, $branchId, $event, $recipient, 'failed', $preview, 'Telegram API request failed.', $metadata);
        } catch (Throwable $exception) {
            Log::warning('Telegram notification failed', [
                'shop_id' => $shop->id,
                'event' => $event,
                'error' => $exception->getMessage(),
            ]);

            return $this->log($shop, $branchId, $event, $recipient, 'failed', $preview, $exception->getMessage(), $metadata);
        }
    }

    private function skipReason(array $settings, string $event, bool $bypassEventToggle): ?string
    {
        if (! config('telegram.enabled')) {
            return 'Telegram is disabled globally.';
        }

        if (! $settings['telegram_enabled']) {
            return 'Telegram is disabled for this shop.';
        }

        if (! filled($settings['telegram_chat_id'])) {
            return 'Telegram chat ID is not configured.';
        }

        if ($bypassEventToggle) {
            return null;
        }

        if (str_starts_with($event, 'order.') && ! $settings['telegram_order_notifications']) {
            return 'Order notifications are disabled.';
        }

        if (str_starts_with($event, 'payment.') && ! $settings['telegram_payment_notifications']) {
            return 'Payment notifications are disabled.';
        }

        if (str_starts_with($event, 'invoice.') && ! $settings['telegram_invoice_notifications']) {
            return 'Invoice notifications are disabled.';
        }

        return null;
    }

    private function log(
        Shop $shop,
        ?int $branchId,
        string $event,
        ?string $recipient,
        string $status,
        string $preview,
        ?string $error,
        array $metadata,
    ): NotificationLog {
        return NotificationLog::create([
            'shop_id' => $shop->id,
            'branch_id' => $branchId,
            'channel' => 'telegram',
            'event' => $event,
            'recipient' => $recipient,
            'status' => $status,
            'message_preview' => $preview,
            'error_message' => $error ? str($error)->limit(500, '')->toString() : null,
            'metadata_json' => $metadata,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    private function itemsSummary(Order $order): string
    {
        return $order->items
            ->map(fn ($item) => "{$item->quantity}x {$item->product_name}")
            ->take(6)
            ->implode(', ');
    }

    private function money(mixed $amount, ?string $currency): string
    {
        return number_format((float) $amount, $currency === 'USD' ? 2 : 0).' '.($currency ?: 'KHR');
    }

    private function adminUrl(string $path): string
    {
        $frontend = rtrim((string) env('FRONTEND_URL', ''), '/');

        return $frontend ? $frontend.$path : $path;
    }
}
