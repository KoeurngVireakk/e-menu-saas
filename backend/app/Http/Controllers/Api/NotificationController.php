<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Models\NotificationLogRead;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'filter' => ['nullable', Rule::in(['all', 'unread'])],
            'category' => ['nullable', Rule::in(['all', 'orders', 'payments', 'system'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $paginator = $this->baseQuery($request)
            ->when(($validated['filter'] ?? 'all') === 'unread', fn (Builder $query) => $this->scopeUnread($query, $request->user()->id))
            ->when(($validated['category'] ?? 'all') !== 'all', fn (Builder $query) => $this->scopeCategory($query, $validated['category']))
            ->latest()
            ->paginate($this->paginationLimit($request, 15, 50));

        $reads = NotificationLogRead::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('notification_log_id', $paginator->getCollection()->pluck('id'))
            ->pluck('read_at', 'notification_log_id');

        return $this->success('Notifications loaded', [
            'notifications' => $paginator->getCollection()
                ->map(fn (NotificationLog $notification) => $this->notificationPayload($notification, $reads->get($notification->id)))
                ->values(),
            'meta' => $this->paginationMeta($paginator),
        ]);
    }

    public function unreadCount(Request $request)
    {
        return $this->success('Unread notification count loaded', [
            'unread_count' => $this->scopeUnread($this->baseQuery($request), $request->user()->id)->count(),
        ]);
    }

    public function markAsRead(Request $request, NotificationLog $notification)
    {
        abort_unless($this->canAccessNotification($request, $notification), 403);

        NotificationLogRead::query()->updateOrCreate(
            [
                'notification_log_id' => $notification->id,
                'user_id' => $request->user()->id,
            ],
            ['read_at' => now()]
        );

        return $this->success('Notification marked as read', [
            'notification' => $this->notificationPayload($notification->load('shop'), now()),
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $now = now();
        $notifications = $this->scopeUnread($this->baseQuery($request), $request->user()->id)
            ->limit(500)
            ->pluck('notification_logs.id');

        foreach ($notifications as $notificationId) {
            NotificationLogRead::query()->updateOrCreate(
                [
                    'notification_log_id' => $notificationId,
                    'user_id' => $request->user()->id,
                ],
                ['read_at' => $now]
            );
        }

        return $this->success('Notifications marked as read', [
            'updated' => $notifications->count(),
        ]);
    }

    private function baseQuery(Request $request): Builder
    {
        $shopIds = $request->user()->accessibleShopIds();

        if (empty($shopIds)) {
            return NotificationLog::query()
                ->with('shop:id,name')
                ->whereRaw('1 = 0');
        }

        return NotificationLog::query()
            ->with('shop:id,name')
            ->where(function (Builder $query) use ($request, $shopIds) {
                foreach ($shopIds as $shopId) {
                    $branchIds = $request->user()->accessibleBranchIdsForShop($shopId);

                    $query->orWhere(function (Builder $shopQuery) use ($shopId, $branchIds) {
                        $shopQuery->where('shop_id', $shopId);

                        if (is_array($branchIds)) {
                            $shopQuery->where(function (Builder $branchQuery) use ($branchIds) {
                                $branchQuery->whereNull('branch_id');

                                if (! empty($branchIds)) {
                                    $branchQuery->orWhereIn('branch_id', $branchIds);
                                }
                            });
                        }
                    });
                }
            });
    }

    private function canAccessNotification(Request $request, NotificationLog $notification): bool
    {
        return $this->baseQuery($request)->whereKey($notification->id)->exists();
    }

    private function scopeUnread(Builder $query, int $userId): Builder
    {
        return $query->whereNotExists(function ($subQuery) use ($userId) {
            $subQuery->select(DB::raw(1))
                ->from('notification_log_reads')
                ->whereColumn('notification_log_reads.notification_log_id', 'notification_logs.id')
                ->where('notification_log_reads.user_id', $userId);
        });
    }

    private function scopeCategory(Builder $query, string $category): Builder
    {
        return match ($category) {
            'orders' => $query->where('event', 'like', 'order.%'),
            'payments' => $query->where(function (Builder $eventQuery) {
                $eventQuery->where('event', 'like', 'payment.%')->orWhere('event', 'like', 'invoice.%');
            }),
            'system' => $query->whereNot(function (Builder $eventQuery) {
                $eventQuery->where('event', 'like', 'order.%')
                    ->orWhere('event', 'like', 'payment.%')
                    ->orWhere('event', 'like', 'invoice.%');
            }),
            default => $query,
        };
    }

    private function notificationPayload(NotificationLog $notification, mixed $readAt): array
    {
        return [
            'id' => $notification->id,
            'type' => $this->typeFor($notification->event),
            'category' => $this->categoryFor($notification->event),
            'title' => $this->titleFor($notification->event),
            'body' => $notification->message_preview,
            'channel' => $notification->channel,
            'status' => $notification->status,
            'shop' => $notification->shop ? [
                'id' => $notification->shop->id,
                'name' => $notification->shop->name,
            ] : null,
            'read_at' => $readAt,
            'created_at' => $notification->created_at,
            'sent_at' => $notification->sent_at,
            'data' => collect($notification->metadata_json ?? [])->only([
                'order_id',
                'order_number',
                'payment_id',
                'invoice_id',
                'sandbox',
                'test',
            ])->all(),
            'action_url' => $this->actionUrlFor($notification->event),
        ];
    }

    private function typeFor(string $event): string
    {
        return match ($event) {
            'order.created' => 'new_order',
            'payment.proof_uploaded' => 'payment_uploaded',
            'payment.paid' => 'payment_confirmed',
            'payment.failed' => 'payment_rejected',
            default => $this->categoryFor($event) === 'system' ? 'system' : $event,
        };
    }

    private function categoryFor(string $event): string
    {
        if (str_starts_with($event, 'order.')) {
            return 'orders';
        }

        if (str_starts_with($event, 'payment.') || str_starts_with($event, 'invoice.')) {
            return 'payments';
        }

        return 'system';
    }

    private function titleFor(string $event): string
    {
        return match ($event) {
            'order.created' => 'New order',
            'payment.proof_uploaded' => 'Payment proof uploaded',
            'payment.paid' => 'Payment confirmed',
            'payment.failed' => 'Payment rejected',
            'invoice.paid' => 'Invoice paid',
            'telegram.test' => 'Telegram test',
            default => str($event)->replace(['.', '_'], ' ')->title()->toString(),
        };
    }

    private function actionUrlFor(string $event): ?string
    {
        return match (true) {
            str_starts_with($event, 'order.') => '/admin/orders',
            str_starts_with($event, 'payment.') => '/admin/payments',
            str_starts_with($event, 'invoice.') => '/admin/invoices',
            default => null,
        };
    }
}
