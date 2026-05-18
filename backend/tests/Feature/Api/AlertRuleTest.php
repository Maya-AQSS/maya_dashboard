<?php

use App\Models\AlertRule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Bypass JWT auth and permission middleware.
    // Note: do NOT inject jwt_user via RouteMatched — if jwt_user is present,
    // AuthorizesByPermission in FormRequests queries the 'user_resolved_permissions'
    // FDW view which does not exist in the test database, causing 500 errors.
    // When jwt_user is null both the middleware and the FormRequest trait return true.
    $this->withoutMiddleware([
        \Maya\Auth\Middleware\JwtMiddleware::class,
        \Maya\Auth\Middleware\RequirePermissionMiddleware::class,
    ]);

    $this->userId = (string) Str::uuid();
    $this->user   = User::forceCreate([
        'id'    => $this->userId,
        'email' => 'alertrule-test@maya.localhost',
        'name'  => 'Alert Rule Test User',
    ]);
});

function makeAlertRule(array $overrides = []): AlertRule
{
    $suffix = substr((string) Str::uuid(), 0, 8);

    return AlertRule::forceCreate(array_merge([
        'slug'             => 'test-rule-' . $suffix,
        'name'             => 'Test Rule ' . $suffix,
        'description'      => 'A test alert rule',
        'query_sql'        => 'SELECT count(*) FROM alerts WHERE severity = \'critical\'',
        'severity'         => 'high',
        'schedule_cron'    => '*/5 * * * *',
        'enabled'          => true,
        'context_template' => [],
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('returns paginated list of alert rules ordered by slug', function () {
    makeAlertRule(['slug' => 'zebra-rule']);
    makeAlertRule(['slug' => 'alpha-rule']);
    makeAlertRule(['slug' => 'middle-rule']);

    $response = $this->getJson('/api/v1/alert-rules');

    $response->assertOk();
    $data = $response->json('data');
    expect($data)->toHaveCount(3);
    // Should be ordered by slug
    expect($data[0]['slug'])->toBe('alpha-rule');
    expect($data[1]['slug'])->toBe('middle-rule');
    expect($data[2]['slug'])->toBe('zebra-rule');
});

it('returns empty list when no alert rules exist', function () {
    $response = $this->getJson('/api/v1/alert-rules');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
});

it('paginates alert rules respecting per_page parameter', function () {
    foreach (range(1, 5) as $i) {
        makeAlertRule(['slug' => "rule-{$i}"]);
    }

    $response = $this->getJson('/api/v1/alert-rules?per_page=2');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('meta.total'))->toBe(5);
});

it('caps per_page at 200', function () {
    foreach (range(1, 3) as $i) {
        makeAlertRule(['slug' => "rule-cap-{$i}"]);
    }

    $response = $this->getJson('/api/v1/alert-rules?per_page=9999');

    $response->assertOk();
    // All 3 returned since 3 < 200 cap
    expect($response->json('data'))->toHaveCount(3);
});

it('sets minimum per_page to 1', function () {
    makeAlertRule(['slug' => 'single-rule']);

    $response = $this->getJson('/api/v1/alert-rules?per_page=0');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

it('index response contains all expected alert rule fields', function () {
    makeAlertRule([
        'slug'     => 'cpu-rule',
        'name'     => 'CPU Rule',
        'severity' => 'critical',
        'enabled'  => true,
    ]);

    $response = $this->getJson('/api/v1/alert-rules');

    $response->assertOk();
    $rule = $response->json('data.0');
    expect($rule)->toHaveKeys(['id', 'slug', 'name', 'description', 'query_sql', 'severity', 'schedule_cron', 'enabled', 'context_template', 'last_evaluated_at', 'created_at', 'updated_at']);
    expect($rule['slug'])->toBe('cpu-rule');
    expect($rule['severity'])->toBe('critical');
    expect($rule['enabled'])->toBeTrue();
});

// ─── store ────────────────────────────────────────────────────────────────────

it('creates an alert rule with valid data', function () {
    $payload = [
        'slug'          => 'new-rule',
        'name'          => 'New Rule',
        'description'   => 'Monitors critical errors',
        'query_sql'     => 'SELECT count(*) FROM alerts WHERE severity = \'critical\'',
        'severity'      => 'critical',
        'schedule_cron' => '0 * * * *',
        'enabled'       => true,
    ];

    $response = $this->postJson('/api/v1/alert-rules', $payload);

    $response->assertCreated();
    expect($response->json('slug'))->toBe('new-rule');
    expect($response->json('name'))->toBe('New Rule');
    expect($response->json('severity'))->toBe('critical');
    expect(AlertRule::where('slug', 'new-rule')->exists())->toBeTrue();
});

it('rejects store when slug is missing', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'name'      => 'Missing Slug',
        'query_sql' => 'SELECT 1',
        'severity'  => 'high',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.slug'))->not->toBeNull();
});

it('rejects store when slug contains uppercase letters', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'INVALID-Slug',
        'name'      => 'Test',
        'query_sql' => 'SELECT 1',
        'severity'  => 'high',
    ]);

    $response->assertUnprocessable();
});

it('rejects store when slug is not unique', function () {
    makeAlertRule(['slug' => 'duplicate-slug']);

    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'duplicate-slug',
        'name'      => 'Another Rule',
        'query_sql' => 'SELECT 1',
        'severity'  => 'high',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.slug'))->not->toBeNull();
});

it('rejects store with invalid severity', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'invalid-severity',
        'name'      => 'Test',
        'query_sql' => 'SELECT 1',
        'severity'  => 'extreme',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.severity'))->not->toBeNull();
});

it('rejects store when query_sql does not start with SELECT', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'bad-query',
        'name'      => 'Test',
        'query_sql' => 'DELETE FROM alerts',
        'severity'  => 'high',
    ]);

    $response->assertUnprocessable();
    expect($response->json('errors.query_sql'))->not->toBeNull();
});

it('rejects store when query_sql contains banned token INSERT', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'inject-rule',
        'name'      => 'Test',
        'query_sql' => 'SELECT * FROM (INSERT INTO alerts VALUES (1)) AS t',
        'severity'  => 'low',
    ]);

    $response->assertUnprocessable();
});

it('rejects store when query_sql contains stacked statements', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'      => 'stacked-rule',
        'name'      => 'Test',
        'query_sql' => 'SELECT 1; DROP TABLE alerts',
        'severity'  => 'low',
    ]);

    $response->assertUnprocessable();
});

it('accepts store with context_template containing sample_columns', function () {
    $response = $this->postJson('/api/v1/alert-rules', [
        'slug'             => 'template-rule',
        'name'             => 'Template Rule',
        'query_sql'        => 'SELECT id, name FROM alerts',
        'severity'         => 'medium',
        'context_template' => ['sample_columns' => ['id', 'name']],
    ]);

    $response->assertCreated();
    expect($response->json('context_template'))->toBe(['sample_columns' => ['id', 'name']]);
});

// ─── update ───────────────────────────────────────────────────────────────────

it('updates an alert rule partially', function () {
    $rule = makeAlertRule(['severity' => 'low']);

    $response = $this->putJson("/api/v1/alert-rules/{$rule->id}", [
        'severity' => 'critical',
        'enabled'  => false,
    ]);

    $response->assertOk();
    expect($response->json('severity'))->toBe('critical');
    expect($response->json('enabled'))->toBeFalse();

    $rule->refresh();
    expect($rule->severity)->toBe('critical');
    expect($rule->enabled)->toBeFalse();
});

it('update returns 404 for non-existent alert rule', function () {
    $response = $this->putJson('/api/v1/alert-rules/9999', [
        'name' => 'Ghost Rule',
    ]);

    $response->assertNotFound();
});

it('update rejects invalid severity', function () {
    $rule = makeAlertRule();

    $response = $this->putJson("/api/v1/alert-rules/{$rule->id}", [
        'severity' => 'nuclear',
    ]);

    $response->assertUnprocessable();
});

it('update rejects unsafe query_sql', function () {
    $rule = makeAlertRule();

    $response = $this->putJson("/api/v1/alert-rules/{$rule->id}", [
        'query_sql' => 'UPDATE alerts SET severity = \'low\'',
    ]);

    $response->assertUnprocessable();
});

it('update response contains expected fields', function () {
    $rule = makeAlertRule(['name' => 'Original Name']);

    $response = $this->putJson("/api/v1/alert-rules/{$rule->id}", [
        'name' => 'Updated Name',
    ]);

    $response->assertOk();
    expect($response->json('name'))->toBe('Updated Name');
    expect($response->json('id'))->toBe($rule->id);
    expect($response->json('slug'))->toBe($rule->slug);
});

// ─── destroy ──────────────────────────────────────────────────────────────────

it('deletes an alert rule and returns 204', function () {
    $rule = makeAlertRule();

    $response = $this->deleteJson("/api/v1/alert-rules/{$rule->id}");

    $response->assertNoContent();
    expect(AlertRule::find($rule->id))->toBeNull();
});

it('delete returns 404 for non-existent alert rule', function () {
    $response = $this->deleteJson('/api/v1/alert-rules/9999');

    $response->assertNotFound();
});
