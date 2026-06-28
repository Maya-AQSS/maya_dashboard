<?php

use App\Models\NotificationDefinition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['cache.default' => 'array']);
    $this->withoutMiddleware([
        \Maya\Auth\Middleware\JwtMiddleware::class,
        \Maya\Auth\Middleware\RequirePermissionMiddleware::class,
    ]);

    $this->userId = (string) Str::uuid();
    User::forceCreate([
        'id' => $this->userId,
        'email' => 'def-test@maya.localhost',
        'name' => 'Def Test',
        'is_active' => true,
    ]);

    // Grant the panel-alert update permission so the FormRequest
    // defense-in-depth check (AuthorizesByPermission) passes.
    DB::table('user_resolved_permissions')->insert([
        'user_id' => $this->userId,
        'permission_slug' => 'dashboard.panel_alerts.update',
    ]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', ['id' => $userId, 'sub' => $userId]);
    });
});

it('lists notification definitions', function () {
    NotificationDefinition::factory()->create(['key' => 'a.one', 'source_app' => 'maya-dms']);
    NotificationDefinition::factory()->scheduled()->create(['key' => 'b.two', 'source_app' => 'maya-logs']);

    $response = $this->getJson('/api/v1/notification-definitions');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('filters definitions by category', function () {
    NotificationDefinition::factory()->create(['key' => 'evt.one', 'category' => 'event']);
    NotificationDefinition::factory()->scheduled()->create(['key' => 'sch.one']);

    $response = $this->getJson('/api/v1/notification-definitions?category=scheduled');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.key'))->toBe('sch.one');
});

it('toggles a definition enabled flag', function () {
    $def = NotificationDefinition::factory()->create(['key' => 'toggle.me', 'enabled' => true]);

    $response = $this->putJson("/api/v1/notification-definitions/{$def->id}", ['enabled' => false]);

    $response->assertOk();
    expect($response->json('data.enabled'))->toBeFalse();
    expect(NotificationDefinition::find($def->id)->enabled)->toBeFalse();
});

it('validates the enabled field on toggle', function () {
    $def = NotificationDefinition::factory()->create(['key' => 'bad.toggle']);

    $this->putJson("/api/v1/notification-definitions/{$def->id}", [])->assertStatus(422);
});
