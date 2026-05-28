<?php

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
        'email' => 'panel-alert-rule-test@maya.localhost',
        'name' => 'Panel Alert Rule Test User',
    ]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id' => $userId,
            'sub' => $userId,
        ]);
    });
});

function makePanelAlertRule(array $overrides = []): PanelAlertRule
{
    return PanelAlertRule::forceCreate(array_merge([
        'name' => 'Test Rule',
        'description' => 'A test panel alert rule',
        'event_type' => 'manual',
        'conditions' => null,
        'alert_text' => 'Something happened',
        'severity' => 'medium',
        'action_label' => null,
        'action_url' => null,
        'visible_duration_hours' => 24,
        'max_frequency_minutes' => 60,
        'is_active' => true,
        'last_triggered_at' => null,
        'created_by' => (string) Str::uuid(),
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('lists panel alert rules and returns paginated response', function () {
    makePanelAlertRule(['name' => 'Rule A']);
    makePanelAlertRule(['name' => 'Rule B']);

    $response = $this->getJson('/api/v1/panel-alert-rules');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('returns 401 when listing panel alert rules without auth', function () {
    $this->withMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);

    $response = $this->getJson('/api/v1/panel-alert-rules');

    $response->assertUnauthorized();
});

it('paginates panel alert rules respecting per_page', function () {
    foreach (range(1, 5) as $i) {
        makePanelAlertRule(['name' => "Rule {$i}"]);
    }

    $response = $this->getJson('/api/v1/panel-alert-rules?per_page=2');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(5);
});

it('index response contains all expected panel alert rule fields', function () {
    makePanelAlertRule([
        'name' => 'Critical Login Rule',
        'severity' => 'critical',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/v1/panel-alert-rules');

    $response->assertOk();
    $rule = $response->json('data.0');
    expect($rule)->toHaveKeys([
        'id', 'name', 'description', 'event_type', 'conditions',
        'alert_text', 'severity', 'action_label', 'action_url',
        'visible_duration_hours', 'max_frequency_minutes',
        'is_active', 'last_triggered_at', 'created_by', 'created_at', 'updated_at',
    ]);
    expect($rule['name'])->toBe('Critical Login Rule');
    expect($rule['severity'])->toBe('critical');
    expect($rule['is_active'])->toBeTrue();
});

// ─── store ────────────────────────────────────────────────────────────────────

it('creates a panel alert rule with valid data', function () {
    $payload = [
        'name' => 'Login Failure Rule',
        'event_type' => 'user.login',
        'alert_text' => 'Login failed for user {{user_id}}',
        'severity' => 'high',
        'is_active' => true,
        'max_frequency_minutes' => 60,
    ];

    $response = $this->postJson('/api/v1/panel-alert-rules', $payload);

    $response->assertStatus(201);
    expect($response->json('data.name'))->toBe('Login Failure Rule');
    expect($response->json('data.severity'))->toBe('high');
    expect(PanelAlertRule::count())->toBe(1);
});

it('returns 401 when creating panel alert rule without auth', function () {
    $this->withMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);

    $response = $this->postJson('/api/v1/panel-alert-rules', [
        'name' => 'Test',
        'event_type' => 'manual',
        'alert_text' => 'Test alert',
        'severity' => 'low',
    ]);

    $response->assertUnauthorized();
});

it('rejects store when required fields are missing', function () {
    $response = $this->postJson('/api/v1/panel-alert-rules', [
        'severity' => 'high',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.name'))->not->toBeNull();
    expect($response->json('errors.event_type'))->not->toBeNull();
    expect($response->json('errors.alert_text'))->not->toBeNull();
});

it('rejects store with invalid severity', function () {
    $response = $this->postJson('/api/v1/panel-alert-rules', [
        'name' => 'Test Rule',
        'event_type' => 'manual',
        'alert_text' => 'Test alert text',
        'severity' => 'extreme',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.severity'))->not->toBeNull();
});

// ─── update ───────────────────────────────────────────────────────────────────

it('updates a panel alert rule with valid data', function () {
    $rule = makePanelAlertRule(['name' => 'Original Name', 'severity' => 'low']);

    $response = $this->putJson("/api/v1/panel-alert-rules/{$rule->id}", [
        'name' => 'Updated Name',
        'severity' => 'critical',
        'event_type' => 'user.login',
        'alert_text' => 'Updated alert text',
    ]);

    $response->assertOk();
    expect($response->json('data.name'))->toBe('Updated Name');
    expect($response->json('data.severity'))->toBe('critical');
});

it('returns 404 when updating a non-existent panel alert rule', function () {
    $response = $this->putJson('/api/v1/panel-alert-rules/9999', [
        'name' => 'Ghost Rule',
        'event_type' => 'manual',
        'alert_text' => 'Test',
        'severity' => 'low',
    ]);

    $response->assertNotFound();
});

it('update rejects invalid severity', function () {
    $rule = makePanelAlertRule();

    $response = $this->putJson("/api/v1/panel-alert-rules/{$rule->id}", [
        'severity' => 'nuclear',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.severity'))->not->toBeNull();
});

// ─── destroy ──────────────────────────────────────────────────────────────────

it('deletes a panel alert rule and returns 204', function () {
    $rule = makePanelAlertRule();

    $response = $this->deleteJson("/api/v1/panel-alert-rules/{$rule->id}");

    $response->assertNoContent();
    expect(PanelAlertRule::find($rule->id))->toBeNull();
});

it('returns 404 when deleting a non-existent panel alert rule', function () {
    $response = $this->deleteJson('/api/v1/panel-alert-rules/9999');

    $response->assertNotFound();
});
