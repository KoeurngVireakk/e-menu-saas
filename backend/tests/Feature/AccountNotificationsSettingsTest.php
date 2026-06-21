<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\NotificationLog;
use App\Models\Shop;
use App\Models\ShopStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountNotificationsSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_show_returns_safe_user_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Sokha Owner',
            'email' => 'owner@example.test',
            'phone' => '+85510000001',
            'role' => 'shop_owner',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/account/profile')
            ->assertOk()
            ->assertJsonPath('data.profile.email', 'owner@example.test')
            ->assertJsonPath('data.profile.role', 'shop_owner')
            ->assertJsonMissingPath('data.profile.password')
            ->assertJsonMissingPath('data.profile.remember_token');
    }

    public function test_profile_update_validates_and_does_not_allow_role_or_status_change(): void
    {
        $user = User::factory()->create([
            'role' => 'shop_owner',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/account/profile', [
            'name' => '',
            'phone' => '+85510000002',
        ])->assertUnprocessable();

        $this->putJson('/api/account/profile', [
            'name' => 'Updated Name',
            'phone' => '+85510000002',
            'role' => 'super_admin',
            'status' => 'disabled',
        ])
            ->assertOk()
            ->assertJsonPath('data.profile.name', 'Updated Name')
            ->assertJsonPath('data.profile.role', 'shop_owner')
            ->assertJsonPath('data.profile.status', 'active');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'phone' => '+85510000002',
            'role' => 'shop_owner',
            'status' => 'active',
        ]);
    }

    public function test_password_update_requires_current_password_and_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/account/password', [
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ])->assertUnprocessable();

        $this->putJson('/api/account/password', [
            'current_password' => 'wrong-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ])->assertUnprocessable();

        $this->putJson('/api/account/password', [
            'current_password' => 'old-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_preferences_can_be_loaded_and_updated(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/account/preferences')
            ->assertOk()
            ->assertJsonPath('data.preferences.language', 'en')
            ->assertJsonPath('data.preferences.timezone', 'Asia/Phnom_Penh');

        $this->putJson('/api/account/preferences', [
            'language' => 'km',
            'timezone' => 'Asia/Phnom_Penh',
            'date_format' => 'dd/mm/yyyy',
            'dashboard_default_range' => '7d',
            'notifications' => [
                'orders' => true,
                'payments' => false,
                'system' => true,
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.preferences.language', 'km')
            ->assertJsonPath('data.preferences.notifications.payments', false);
    }

    public function test_notification_list_is_scoped_to_accessible_shops_and_unread_count_works(): void
    {
        [$owner, $shop, $branch] = $this->shopWithBranch();
        [$otherOwner, $otherShop] = $this->shopWithBranch('Other Shop');

        $visible = NotificationLog::create([
            'shop_id' => $shop->id,
            'branch_id' => $branch->id,
            'channel' => 'telegram',
            'event' => 'order.created',
            'status' => 'sent',
            'message_preview' => 'New order: ORD-1',
            'metadata_json' => ['order_id' => 1, 'secret' => 'do-not-return'],
            'sent_at' => now(),
        ]);

        NotificationLog::create([
            'shop_id' => $otherShop->id,
            'branch_id' => null,
            'channel' => 'telegram',
            'event' => 'payment.paid',
            'status' => 'sent',
            'message_preview' => 'Other payment',
            'metadata_json' => ['payment_id' => 9],
            'sent_at' => now(),
        ]);

        Sanctum::actingAs($owner);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data.notifications')
            ->assertJsonPath('data.notifications.0.id', $visible->id)
            ->assertJsonPath('data.notifications.0.category', 'orders')
            ->assertJsonMissingPath('data.notifications.0.data.secret');

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 1);

        Sanctum::actingAs($otherOwner);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data.notifications')
            ->assertJsonPath('data.notifications.0.body', 'Other payment');
    }

    public function test_mark_as_read_and_read_all_are_user_scoped(): void
    {
        [$owner, $shop] = $this->shopWithBranch();
        $manager = User::factory()->create(['role' => 'manager']);
        ShopStaff::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);

        $first = NotificationLog::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'channel' => 'telegram',
            'event' => 'payment.proof_uploaded',
            'status' => 'sent',
            'message_preview' => 'Payment proof uploaded',
        ]);

        NotificationLog::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'channel' => 'telegram',
            'event' => 'telegram.test',
            'status' => 'sent',
            'message_preview' => 'Telegram test',
        ]);

        Sanctum::actingAs($owner);

        $this->postJson("/api/notifications/{$first->id}/read")
            ->assertOk()
            ->assertJsonPath('data.notification.id', $first->id);

        $this->getJson('/api/notifications/unread-count')
            ->assertJsonPath('data.count', 1);

        Sanctum::actingAs($manager);

        $this->getJson('/api/notifications/unread-count')
            ->assertJsonPath('data.count', 2);

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated', 2);

        $this->getJson('/api/notifications/unread-count')
            ->assertJsonPath('data.count', 0);
    }

    public function test_settings_update_permission_is_preserved(): void
    {
        [$owner, $shop] = $this->shopWithBranch();
        $manager = User::factory()->create(['role' => 'manager']);

        ShopStaff::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);

        Sanctum::actingAs($manager);

        $this->getJson("/api/shops/{$shop->id}/settings")->assertOk();

        $this->postJson("/api/shops/{$shop->id}/settings", [
            'name' => 'Blocked Update',
            'currency_code' => 'KHR',
        ])->assertForbidden();

        Sanctum::actingAs($owner);

        $this->postJson("/api/shops/{$shop->id}/settings", [
            'name' => 'Allowed Update',
            'currency_code' => 'KHR',
        ])->assertOk();
    }

    private function shopWithBranch(string $shopName = 'QA Cafe'): array
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => $shopName,
            'slug' => str($shopName)->slug('-').'-'.uniqid(),
            'currency_code' => 'KHR',
            'status' => 'active',
        ]);
        $branch = Branch::create([
            'shop_id' => $shop->id,
            'name' => 'Main Branch',
            'status' => 'active',
        ]);

        return [$owner, $shop, $branch];
    }
}
