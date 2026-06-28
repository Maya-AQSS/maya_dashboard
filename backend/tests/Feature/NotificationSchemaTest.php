<?php

use App\DTOs\AlertAudienceDto;
use App\Models\Notification;
use App\Models\NotificationDefinition;
use App\Models\PanelAlert;
use Database\Seeders\NotificationDefinitionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('creates the unified schema without legacy tables', function () {
    expect(Schema::hasTable('notifications'))->toBeTrue();
    expect(Schema::hasTable('notification_definitions'))->toBeTrue();
    expect(Schema::hasTable('panel_alerts'))->toBeTrue();

    expect(Schema::hasTable('alerts'))->toBeFalse();
    expect(Schema::hasTable('alert_rules'))->toBeFalse();
    expect(Schema::hasTable('panel_alert_rules'))->toBeFalse();
});

it('notifications carry severity, url and i18n keys', function () {
    foreach (['severity', 'url', 'title_key', 'body_key', 'params', 'scope'] as $col) {
        expect(Schema::hasColumn('notifications', $col))->toBeTrue("missing column {$col}");
    }
    expect(Schema::hasColumn('notifications', 'is_critical'))->toBeFalse();

    $n = Notification::factory()->fromKeys('document.published')->create([
        'severity' => 'high',
        'url' => '/documents/42',
        'params' => ['document_id' => 42],
    ]);

    expect($n->isCritical())->toBeTrue();
    expect($n->params)->toBe(['document_id' => 42]);
    expect(Notification::query()->critical()->count())->toBe(1);
});

it('persists panel-alert audience as a JSON value object', function () {
    $audience = AlertAudienceDto::fromValidatedInput([
        'notify_all' => false,
        'audience_kind' => 'team',
        'audience_team_id' => 'team-7',
    ]);

    $alert = PanelAlert::factory()->create(['audience' => $audience]);

    $fresh = PanelAlert::find($alert->id);
    expect($fresh->audience)->toBeInstanceOf(AlertAudienceDto::class);
    expect($fresh->audience->notifyAll)->toBeFalse();
    expect($fresh->audience->audienceKind)->toBe('team');
    expect($fresh->audience->audienceTeamId)->toBe('team-7');
});

it('supports recurring panel alerts', function () {
    $alert = PanelAlert::factory()->recurring('0 9 * * 1', 120)->create();

    expect($alert->isRecurring())->toBeTrue();
    expect(PanelAlert::query()->recurring()->count())->toBe(1);
    expect($alert->duration_minutes)->toBe(120);
});

it('seeds the notification definition catalog', function () {
    (new NotificationDefinitionSeeder())->run();

    expect(NotificationDefinition::count())->toBeGreaterThanOrEqual(14);
    expect(NotificationDefinition::where('key', 'document.validation_requested')->exists())->toBeTrue();
    expect(NotificationDefinition::query()->scheduled()->count())->toBeGreaterThanOrEqual(3);

    expect(NotificationDefinition::where('key', 'document.published')->first()->title_key)->toBe('notifications.document.published.title');
    expect(NotificationDefinition::where('key', 'document.published')->first()->url_template)->toBe('/documents/{document_id}');
    expect(NotificationDefinition::where('key', 'template.ownership_transferred')->exists())->toBeTrue();
    expect(NotificationDefinition::where('key', 'document.ownership_transferred')->exists())->toBeTrue();
});

it('gates ingestion by the enabled flag with unknown keys allowed', function () {
    NotificationDefinition::factory()->create(['key' => 'foo.enabled', 'enabled' => true]);
    NotificationDefinition::factory()->disabled()->create(['key' => 'foo.disabled']);

    $service = app(\App\Services\Contracts\NotificationDefinitionServiceInterface::class);

    expect($service->isKeyEnabled('foo.enabled'))->toBeTrue();
    expect($service->isKeyEnabled('foo.disabled'))->toBeFalse();
    expect($service->isKeyEnabled('never.defined'))->toBeTrue();
});
