<?php

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware([
        \Maya\Auth\Middleware\JwtMiddleware::class,
        \Maya\Auth\Middleware\RequirePermissionMiddleware::class,
    ]);

    $this->userId = (string) Str::uuid();
    $this->user   = User::forceCreate([
        'id'    => $this->userId,
        'email' => 'notification-test@maya.localhost',
        'name'  => 'Notification Test User',
    ]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id'  => $userId,
            'sub' => $userId,
        ]);
    });
});

function makeNotification(string $recipientId, array $overrides = []): Notification
{
    return Notification::forceCreate(array_merge([
        'message_id'   => (string) Str::uuid(),
        'app'          => 'maya-authorization',
        'type'         => 'user.created',
        'recipient_id' => $recipientId,
        'title'        => 'Test Notification',
        'body'         => 'Test body',
        'channels'     => ['app'],
        'metadata'     => [],
        'read_at'      => null,
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('returns paginated notifications for the authenticated user', function () {
    makeNotification($this->userId);
    makeNotification($this->userId);

    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(2);
});

it('does not return notifications for other users', function () {
    $otherId = (string) Str::uuid();
    makeNotification($otherId);
    makeNotification($this->userId);

    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.recipient_id'))->toBe($this->userId);
});

it('filters unread notifications when unread_only=1', function () {
    makeNotification($this->userId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => now()]);

    $response = $this->getJson('/api/v1/notifications?unread_only=1');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.read_at'))->toBeNull();
});

it('filters by type when type parameter is provided', function () {
    makeNotification($this->userId, ['type' => 'user.created']);
    makeNotification($this->userId, ['type' => 'document.approved']);

    $response = $this->getJson('/api/v1/notifications?type=user.created');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.type'))->toBe('user.created');
});

it('respects per_page parameter', function () {
    foreach (range(1, 5) as $_) {
        makeNotification($this->userId);
    }

    $response = $this->getJson('/api/v1/notifications?per_page=2');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(5);
});

it('defaults per_page to 25 when not specified', function () {
    foreach (range(1, 3) as $_) {
        makeNotification($this->userId);
    }

    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    expect($response->json('per_page'))->toBe(25);
});

it('rejects invalid per_page value', function () {
    $response = $this->getJson('/api/v1/notifications?per_page=invalid');

    $response->assertUnprocessable();
});

it('rejects per_page exceeding max of 100', function () {
    $response = $this->getJson('/api/v1/notifications?per_page=101');

    $response->assertUnprocessable();
});

it('index response contains pagination metadata', function () {
    makeNotification($this->userId);

    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    expect($response->json())->toHaveKeys(['data', 'total', 'per_page', 'current_page']);
});

it('notification data contains expected fields', function () {
    makeNotification($this->userId, [
        'type'  => 'test.event',
        'title' => 'My Notification',
        'body'  => 'Notification body',
    ]);

    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    $item = $response->json('data.0');
    expect($item)->toHaveKeys(['id', 'message_id', 'app', 'type', 'recipient_id', 'title', 'body', 'channels', 'metadata', 'read_at', 'created_at']);
    expect($item['type'])->toBe('test.event');
    expect($item['title'])->toBe('My Notification');
});

it('returns empty list when user has no notifications', function () {
    $response = $this->getJson('/api/v1/notifications');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
    expect($response->json('total'))->toBe(0);
});

// ─── unreadCount ──────────────────────────────────────────────────────────────

it('returns the unread notification count', function () {
    makeNotification($this->userId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => now()]);

    $response = $this->getJson('/api/v1/notifications/unread-count');

    $response->assertOk();
    expect($response->json('data.unread'))->toBe(2);
});

it('returns zero unread count when all notifications are read', function () {
    makeNotification($this->userId, ['read_at' => now()]);
    makeNotification($this->userId, ['read_at' => now()]);

    $response = $this->getJson('/api/v1/notifications/unread-count');

    $response->assertOk();
    expect($response->json('data.unread'))->toBe(0);
});

it('returns zero unread count when user has no notifications', function () {
    $response = $this->getJson('/api/v1/notifications/unread-count');

    $response->assertOk();
    expect($response->json('data.unread'))->toBe(0);
});

it('unread count only counts own notifications', function () {
    $otherId = (string) Str::uuid();
    makeNotification($otherId, ['read_at' => null]);
    makeNotification($otherId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => null]);

    $response = $this->getJson('/api/v1/notifications/unread-count');

    $response->assertOk();
    expect($response->json('data.unread'))->toBe(1);
});

// ─── markRead ─────────────────────────────────────────────────────────────────

it('marks a notification as read', function () {
    $notification = makeNotification($this->userId, ['read_at' => null]);

    $response = $this->postJson("/api/v1/notifications/{$notification->id}/read");

    $response->assertOk();
    expect($response->json('data.read_at'))->not->toBeNull();
    $notification->refresh();
    expect($notification->read_at)->not->toBeNull();
});

it('markRead is idempotent — read_at is not overwritten', function () {
    $readAt = now()->subHour();
    $notification = makeNotification($this->userId, ['read_at' => $readAt]);

    $this->travel(2)->seconds();
    $response = $this->postJson("/api/v1/notifications/{$notification->id}/read");

    $response->assertOk();
    $notification->refresh();
    // read_at should not have changed
    expect($notification->read_at->toIso8601String())->toBe($readAt->toIso8601String());
});

it('markRead returns 404 for a notification belonging to another user', function () {
    $otherId = (string) Str::uuid();
    $notification = makeNotification($otherId);

    $response = $this->postJson("/api/v1/notifications/{$notification->id}/read");

    $response->assertNotFound();
});

it('markRead returns 404 for non-existent notification', function () {
    $response = $this->postJson('/api/v1/notifications/9999/read');

    $response->assertNotFound();
});

// ─── markAllRead ──────────────────────────────────────────────────────────────

it('marks all user notifications as read', function () {
    makeNotification($this->userId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => null]);

    $response = $this->postJson('/api/v1/notifications/mark-all-read');

    $response->assertOk();
    expect($response->json('data.updated'))->toBe(3);

    $remaining = Notification::where('recipient_id', $this->userId)->whereNull('read_at')->count();
    expect($remaining)->toBe(0);
});

it('markAllRead returns 0 when all notifications are already read', function () {
    makeNotification($this->userId, ['read_at' => now()]);

    $response = $this->postJson('/api/v1/notifications/mark-all-read');

    $response->assertOk();
    expect($response->json('data.updated'))->toBe(0);
});

it('markAllRead only affects own notifications', function () {
    $otherId = (string) Str::uuid();
    $otherNotif = makeNotification($otherId, ['read_at' => null]);
    makeNotification($this->userId, ['read_at' => null]);

    $response = $this->postJson('/api/v1/notifications/mark-all-read');

    $response->assertOk();
    expect($response->json('data.updated'))->toBe(1);

    // Other user's notification should still be unread
    $otherNotif->refresh();
    expect($otherNotif->read_at)->toBeNull();
});

// ─── destroy ────────────────────────────────────────────────────────────────────

it('deletes own notification and returns 204', function () {
    $n = makeNotification($this->userId);

    $response = $this->deleteJson("/api/v1/notifications/{$n->id}");

    $response->assertNoContent();
    expect(\App\Models\Notification::find($n->id))->toBeNull();
});

it('returns 404 when deleting a notification of another user', function () {
    $other = makeNotification((string) Str::uuid());

    $this->deleteJson("/api/v1/notifications/{$other->id}")->assertNotFound();
    expect(\App\Models\Notification::find($other->id))->not->toBeNull();
});
