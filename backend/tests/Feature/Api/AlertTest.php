<?php

use App\Http\Controllers\Api\V1\Alerts\AlertController;
use App\Models\Alert;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);

    $this->userId = (string) Str::uuid();
    $this->user   = User::forceCreate([
        'id'    => $this->userId,
        'email' => 'test@maya.localhost',
        'name'  => 'Test User',
    ]);
});

function makeAlert(array $overrides = []): Alert
{
    return Alert::forceCreate(array_merge([
        'message_id' => (string) Str::uuid(),
        'severity'   => 'high',
        'title'      => 'Test Alert',
        'source'     => 'app.publish',
        'context'    => [],
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('lists only active alerts by default', function () {
    makeAlert(['severity' => 'critical']);
    makeAlert(['message_id' => (string) Str::uuid(), 'resolved_at' => now()]);

    $response = $this->getJson('/api/v1/alerts');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.severity'))->toBe('critical');
});

it('includes resolved alerts when active_only=false', function () {
    makeAlert();
    makeAlert(['message_id' => (string) Str::uuid(), 'resolved_at' => now()]);

    $response = $this->getJson('/api/v1/alerts?active_only=false');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('filters by severity', function () {
    makeAlert(['severity' => 'high']);
    makeAlert(['message_id' => (string) Str::uuid(), 'severity' => 'low']);

    $response = $this->getJson('/api/v1/alerts?severity=high&active_only=false');

    $response->assertOk();
    $severities = collect($response->json('data'))->pluck('severity')->unique()->values()->all();
    expect($severities)->toBe(['high']);
});

it('paginates results respecting per_page cap of 100', function () {
    foreach (range(1, 5) as $_) {
        makeAlert(['message_id' => (string) Str::uuid()]);
    }

    $response = $this->getJson('/api/v1/alerts?per_page=2');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('meta.total'))->toBe(5);
});

// ─── acknowledge ──────────────────────────────────────────────────────────────

it('acknowledges an alert and preserves the Keycloak UUID — not cast to int', function () {
    $alert = makeAlert();

    // Mock resolveKeycloakUser so we can test the controller without a real JWT.
    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson("/api/v1/alerts/{$alert->id}/acknowledge")->assertOk();

    $alert->refresh();
    expect($alert->acknowledged_at)->not->toBeNull();
    // UUID must be stored as string — regression test for the (int) cast bug.
    expect($alert->acknowledged_by)->toBe($this->userId);
    expect($alert->acknowledged_by)->not->toBe('0');
});

it('acknowledge is idempotent — second call does not overwrite acknowledged_at', function () {
    $alert = makeAlert();

    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson("/api/v1/alerts/{$alert->id}/acknowledge")->assertOk();
    $first = $alert->refresh()->acknowledged_at;

    $this->travel(1)->seconds();

    $this->postJson("/api/v1/alerts/{$alert->id}/acknowledge")->assertOk();

    expect($alert->refresh()->acknowledged_at->toIso8601String())->toBe($first->toIso8601String());
});

it('returns 404 when acknowledging a non-existent alert', function () {
    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson('/api/v1/alerts/9999/acknowledge')->assertNotFound();
});

// ─── resolve ──────────────────────────────────────────────────────────────────

it('resolves an alert and stores resolved_by as UUID string', function () {
    $alert = makeAlert();

    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson("/api/v1/alerts/{$alert->id}/resolve")->assertOk();

    $alert->refresh();
    expect($alert->resolved_at)->not->toBeNull();
    expect($alert->resolved_by)->toBe($this->userId);
});

it('resolve auto-acknowledges an unacknowledged alert', function () {
    $alert = makeAlert();
    expect($alert->acknowledged_at)->toBeNull();

    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson("/api/v1/alerts/{$alert->id}/resolve")->assertOk();

    $alert->refresh();
    expect($alert->acknowledged_at)->not->toBeNull();
    expect($alert->acknowledged_by)->toBe($this->userId);
});

it('returns 404 when resolving a non-existent alert', function () {
    $this->partialMock(AlertController::class, function ($mock) {
        $mock->shouldReceive('resolveKeycloakUser')->andReturn($this->user);
    });

    $this->postJson('/api/v1/alerts/9999/resolve')->assertNotFound();
});
