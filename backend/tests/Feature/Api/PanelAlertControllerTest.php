<?php

use App\Models\PanelAlert;
use App\Models\PanelAlertRule;
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
    $this->user = User::forceCreate([
        'id' => $this->userId,
        'email' => 'panel-alert-test@maya.localhost',
        'name' => 'Panel Alert Test User',
    ]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id' => $userId,
            'sub' => $userId,
        ]);
    });
});

function makePanelAlert(array $overrides = []): PanelAlert
{
    return PanelAlert::forceCreate(array_merge([
        'text' => 'Test alert text',
        'severity' => 'high',
        'visible_from' => now()->subHour(),
        'visible_until' => now()->addDay(),
        'source' => 'manual',
        'created_by' => (string) Str::uuid(),
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('lists panel alerts and returns paginated response', function () {
    makePanelAlert(['severity' => 'critical']);
    makePanelAlert(['severity' => 'low']);

    $response = $this->getJson('/api/v1/panel-alerts');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('returns 401 when listing panel alerts without auth', function () {
    $this->withMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);

    $response = $this->getJson('/api/v1/panel-alerts');

    $response->assertUnauthorized();
});

it('filters panel alerts by severity', function () {
    makePanelAlert(['severity' => 'critical']);
    makePanelAlert(['severity' => 'low']);

    $response = $this->getJson('/api/v1/panel-alerts?severity=critical');

    $response->assertOk();
    $severities = collect($response->json('data'))->pluck('severity')->unique()->values()->all();
    expect($severities)->toBe(['critical']);
});

it('rejects invalid severity filter with 422', function () {
    $response = $this->getJson('/api/v1/panel-alerts?severity=extreme');

    $response->assertUnprocessable();
});

it('paginates panel alerts respecting per_page', function () {
    foreach (range(1, 5) as $_) {
        makePanelAlert();
    }

    $response = $this->getJson('/api/v1/panel-alerts?per_page=2');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(5);
});

// ─── store ────────────────────────────────────────────────────────────────────

it('creates a panel alert with valid data', function () {
    $payload = [
        'text' => 'System maintenance tonight',
        'severity' => 'medium',
        'visible_from' => now()->toIso8601String(),
        'visible_until' => now()->addDay()->toIso8601String(),
    ];

    $response = $this->postJson('/api/v1/panel-alerts', $payload);

    $response->assertStatus(201);
    expect($response->json('data.text'))->toBe('System maintenance tonight');
    expect($response->json('data.severity'))->toBe('medium');
    expect(PanelAlert::count())->toBe(1);
});

it('returns 401 when creating panel alert without auth', function () {
    $this->withMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);

    $response = $this->postJson('/api/v1/panel-alerts', [
        'text' => 'Test',
        'severity' => 'low',
        'visible_from' => now()->toIso8601String(),
    ]);

    $response->assertUnauthorized();
});

it('rejects store when required fields are missing', function () {
    $response = $this->postJson('/api/v1/panel-alerts', [
        'severity' => 'low',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.text'))->not->toBeNull();
    expect($response->json('errors.visible_from'))->not->toBeNull();
});

it('rejects store with invalid severity', function () {
    $response = $this->postJson('/api/v1/panel-alerts', [
        'text' => 'Test',
        'severity' => 'nuclear',
        'visible_from' => now()->toIso8601String(),
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.severity'))->not->toBeNull();
});

it('rejects store when visible_until is before visible_from', function () {
    $response = $this->postJson('/api/v1/panel-alerts', [
        'text' => 'Test',
        'severity' => 'low',
        'visible_from' => now()->addDay()->toIso8601String(),
        'visible_until' => now()->toIso8601String(),
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.visible_until'))->not->toBeNull();
});

// ─── update ───────────────────────────────────────────────────────────────────

it('updates a panel alert with valid data', function () {
    $alert = makePanelAlert(['severity' => 'low', 'text' => 'Original text']);

    $response = $this->putJson("/api/v1/panel-alerts/{$alert->id}", [
        'text' => 'Updated text',
        'severity' => 'high',
        'visible_from' => now()->toIso8601String(),
    ]);

    $response->assertOk();
    expect($response->json('data.text'))->toBe('Updated text');
    expect($response->json('data.severity'))->toBe('high');
});

it('returns 404 when updating a non-existent panel alert', function () {
    $response = $this->putJson('/api/v1/panel-alerts/9999', [
        'text' => 'Ghost alert',
        'severity' => 'low',
        'visible_from' => now()->toIso8601String(),
    ]);

    $response->assertNotFound();
});

// ─── destroy ──────────────────────────────────────────────────────────────────

it('deletes a panel alert and returns 204', function () {
    $alert = makePanelAlert();

    $response = $this->deleteJson("/api/v1/panel-alerts/{$alert->id}");

    $response->assertNoContent();
    expect(PanelAlert::find($alert->id))->toBeNull();
});

it('returns 404 when deleting a non-existent panel alert', function () {
    $response = $this->deleteJson('/api/v1/panel-alerts/9999');

    $response->assertNotFound();
});
