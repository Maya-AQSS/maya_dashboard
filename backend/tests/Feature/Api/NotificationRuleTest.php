<?php

use App\Models\NotificationDefinition;
use App\Models\NotificationRule;
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
    User::forceCreate(['id' => $this->userId, 'email' => 'rule-test@maya.localhost', 'name' => 'Rule Test', 'is_active' => true]);

    // Grant the panel-alert admin permissions so the FormRequest
    // defense-in-depth check (AuthorizesByPermission) passes.
    DB::table('user_resolved_permissions')->insert([
        ['user_id' => $this->userId, 'permission_slug' => 'dashboard.panel_alerts.create'],
        ['user_id' => $this->userId, 'permission_slug' => 'dashboard.panel_alerts.update'],
    ]);

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', ['id' => $userId, 'sub' => $userId]);
    });

    // A scheduled definition the rule can reference.
    NotificationDefinition::factory()->scheduled()->create([
        'key' => 'dms.pending_validations_threshold',
        'source_app' => 'maya-dms',
        'default_severity' => 'medium',
        'enabled' => true,
    ]);
});

it('creates a rule referencing a scheduled definition', function () {
    $response = $this->postJson('/api/v1/notification-rules', [
        'evaluator_key' => 'dms.pending_validations_threshold',
        'name' => 'Pendientes > 20',
        'params' => ['threshold' => 20],
        'schedule_cron' => '0 7 * * *',
        'notify_all' => true,
    ]);

    $response->assertStatus(201);
    expect($response->json('data.source_app'))->toBe('maya-dms'); // auto-filled from definition
    expect($response->json('data.params.threshold'))->toBe(20);
    expect(NotificationRule::count())->toBe(1);
});

it('rejects a rule whose evaluator_key is not a scheduled definition', function () {
    NotificationDefinition::factory()->create(['key' => 'document.published', 'category' => 'event']);

    $this->postJson('/api/v1/notification-rules', [
        'evaluator_key' => 'document.published',
        'name' => 'bad',
        'schedule_cron' => '0 7 * * *',
        'notify_all' => true,
    ])->assertStatus(422);

    $this->postJson('/api/v1/notification-rules', [
        'evaluator_key' => 'does.not.exist',
        'name' => 'bad',
        'schedule_cron' => '0 7 * * *',
        'notify_all' => true,
    ])->assertStatus(422);
});

it('lists, shows, updates and deletes rules', function () {
    $rule = NotificationRule::factory()->create(['name' => 'Original']);

    $this->getJson('/api/v1/notification-rules')->assertOk()->assertJsonPath('data.0.id', $rule->id);
    $this->getJson("/api/v1/notification-rules/{$rule->id}")->assertOk()->assertJsonPath('data.name', 'Original');

    $this->putJson("/api/v1/notification-rules/{$rule->id}", ['name' => 'Editada', 'params' => ['threshold' => 50]])
        ->assertOk()->assertJsonPath('data.name', 'Editada')->assertJsonPath('data.params.threshold', 50);

    $this->deleteJson("/api/v1/notification-rules/{$rule->id}")->assertNoContent();
    expect(NotificationRule::find($rule->id))->toBeNull();
});

it('persists audience as a value object', function () {
    // Bypass the creator-owns-audience check (covered elsewhere); we test persistence.
    $validator = Mockery::mock(\App\Services\Contracts\AlertAudienceValidatorInterface::class);
    $validator->shouldReceive('assertCreatorOwnsAudience')->andReturnNull();
    $this->app->instance(\App\Services\Contracts\AlertAudienceValidatorInterface::class, $validator);

    $response = $this->postJson('/api/v1/notification-rules', [
        'evaluator_key' => 'dms.pending_validations_threshold',
        'name' => 'Equipo dir',
        'schedule_cron' => '0 7 * * *',
        'notify_all' => false,
        'audience_kind' => 'team',
        'audience_team_id' => 'team-9',
    ]);

    $response->assertStatus(201);
    expect($response->json('data.notify_all'))->toBeFalse();
    expect($response->json('data.audience_team_id'))->toBe('team-9');
});

it('exposes only enabled rules of enabled definitions through the v_notification_rules view', function () {
    NotificationRule::factory()->create(['evaluator_key' => 'dms.pending_validations_threshold', 'severity' => null, 'enabled' => true]);
    NotificationRule::factory()->disabled()->create(['evaluator_key' => 'dms.pending_validations_threshold']);

    $rows = DB::select('SELECT evaluator_key, severity FROM v_notification_rules');
    expect($rows)->toHaveCount(1);
    expect($rows[0]->severity)->toBe('medium'); // coalesced from definition default

    // Disabling the definition hides all its rules from the contract view.
    NotificationDefinition::where('key', 'dms.pending_validations_threshold')->update(['enabled' => false]);
    expect(DB::select('SELECT 1 FROM v_notification_rules'))->toHaveCount(0);
});
