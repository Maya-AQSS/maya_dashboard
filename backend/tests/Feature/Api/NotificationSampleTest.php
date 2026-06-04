<?php

use App\Models\Notification;
use App\Models\NotificationDefinition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['broadcasting.default' => 'null', 'messaging.app' => 'maya-dashboard']);
    $this->withoutMiddleware([
        \Maya\Auth\Middleware\JwtMiddleware::class,
        \Maya\Auth\Middleware\RequirePermissionMiddleware::class,
    ]);

    $this->userId = (string) Str::uuid();
    User::forceCreate(['id' => $this->userId, 'email' => 'sample-test@maya.localhost', 'name' => 'Sample Test', 'is_active' => true]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', ['id' => $userId, 'sub' => $userId]);
    });
});

it('fires a sample notification of a type to the current user', function () {
    NotificationDefinition::factory()->create([
        'key' => 'document.published',
        'category' => 'event',
        'default_severity' => 'info',
        'url_template' => '/documents/{document_id}',
        'title_key' => 'notifications.document.published.title',
        'body_key' => 'notifications.document.published.body',
        'enabled' => true,
    ]);

    $response = $this->postJson('/api/v1/notifications/fire-sample', ['key' => 'document.published']);

    $response->assertOk();
    expect($response->json('data.delivered'))->toBeTrue();

    $n = Notification::where('type', 'document.published')->where('recipient_id', $this->userId)->latest('id')->first();
    expect($n)->not->toBeNull();
    expect($n->severity)->toBe('info');
    expect($n->url)->toBe('/documents/DOC-123'); // url_template filled from sample params
    expect($n->params['document_title'])->toBe('Acta de ejemplo');
});

it('validates that key is required', function () {
    $this->postJson('/api/v1/notifications/fire-sample', [])->assertStatus(422);
});

it('respects the gate — disabled type is not delivered', function () {
    NotificationDefinition::factory()->disabled()->create(['key' => 'document.rejected', 'category' => 'event']);

    $response = $this->postJson('/api/v1/notifications/fire-sample', ['key' => 'document.rejected']);

    $response->assertOk();
    expect($response->json('data.delivered'))->toBeTrue(); // ingest returns true (acknowledged/dropped)
    expect(Notification::where('type', 'document.rejected')->count())->toBe(0); // but nothing persisted
});

it('fires a dashboard-scoped sample without a recipient', function () {
    NotificationDefinition::factory()->scheduled()->create([
        'key' => 'logs.error_spike',
        'default_severity' => 'critical',
        'url_template' => '/logs',
        'enabled' => true,
    ]);

    $this->postJson('/api/v1/notifications/fire-sample', ['key' => 'logs.error_spike'])->assertOk();

    $n = Notification::where('type', 'logs.error_spike')->latest('id')->first();
    expect($n)->not->toBeNull();
    expect($n->scope)->toBe('dashboard');
    expect($n->recipient_id)->toBeNull();
    expect($n->params['count'])->toBe(42);
});
