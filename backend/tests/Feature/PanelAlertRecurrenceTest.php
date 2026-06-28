<?php

use App\DTOs\AlertAudienceDto;
use App\Models\PanelAlert;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\PanelAlertNotificationServiceInterface;
use App\Services\PanelAlerts\PanelAlertMaterializer;
use App\Services\PanelAlerts\PanelAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Maya\Messaging\Publishers\AuditPublisher;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['broadcasting.default' => 'null']);

    // Observer side effects: silence audit, count notifications.
    $this->app->instance(AuditPublisher::class, Mockery::mock(AuditPublisher::class)->shouldIgnoreMissing());

    $this->notifySpy = Mockery::mock(PanelAlertNotificationServiceInterface::class);
    $this->notifySpy->shouldReceive('notifyUsersOfNewAlert')->andReturn(3)->byDefault();
    $this->app->instance(PanelAlertNotificationServiceInterface::class, $this->notifySpy);
});

function recurringAlert(array $overrides = []): PanelAlert
{
    return PanelAlert::forceCreate(array_merge([
        'text' => 'Recurring alert',
        'severity' => 'high',
        'visible_from' => now()->subDays(2),
        'visible_until' => now()->subDay(),
        'schedule_cron' => '0 9 * * 1',
        'duration_minutes' => 120,
        'last_materialized_at' => now()->subDays(8),
        'source' => 'manual',
        'created_by' => (string) Str::uuid(),
    ], $overrides));
}

// ─── Materializer (recurrence) ──────────────────────────────────────────────

it('re-materializes a recurring alert whose cron is due', function () {
    $alert = recurringAlert();

    $now = Carbon::parse('2026-06-08 10:00:00'); // a Monday, after 09:00
    $count = app(PanelAlertMaterializer::class)->run($now);

    expect($count)->toBe(1);

    $alert->refresh();
    expect($alert->visible_from->toDateTimeString())->toBe('2026-06-08 10:00:00');
    expect($alert->visible_until->toDateTimeString())->toBe('2026-06-08 12:00:00'); // +120 min
    expect($alert->last_materialized_at->toDateTimeString())->toBe('2026-06-08 10:00:00');
});

it('does not re-materialize when the cron is not yet due', function () {
    recurringAlert(['last_materialized_at' => Carbon::parse('2026-06-08 09:00:00')]);

    // Tuesday — next Monday run hasn't happened since last materialization.
    $now = Carbon::parse('2026-06-09 10:00:00');

    expect(app(PanelAlertMaterializer::class)->run($now))->toBe(0);
});

it('ignores non-recurring alerts', function () {
    PanelAlert::factory()->create(['schedule_cron' => null]);

    expect(app(PanelAlertMaterializer::class)->run(now()))->toBe(0);
});

// ─── Edit re-notifies (fix B1) ───────────────────────────────────────────────

it('re-notifies recipients when an alert is edited (content/window change)', function () {
    $alert = PanelAlert::factory()->create(['text' => 'Original']);
    // created() fired one notification.
    $this->notifySpy->shouldHaveReceived('notifyUsersOfNewAlert')->once();

    $alert->update(['text' => 'Edited text']);

    // updated() with a notify-worthy change fires a second notification.
    $this->notifySpy->shouldHaveReceived('notifyUsersOfNewAlert')->twice();
});

it('does not re-notify when only non-content fields change', function () {
    $alert = PanelAlert::factory()->create();
    $this->notifySpy->shouldHaveReceived('notifyUsersOfNewAlert')->once();

    $alert->update(['schedule_cron' => '0 8 * * *', 'last_materialized_at' => now()]);

    // No additional notification (schedule_cron/last_materialized_at are not notify-worthy).
    $this->notifySpy->shouldHaveReceived('notifyUsersOfNewAlert')->once();
});

// ─── Window computation from duration (fix B2) ───────────────────────────────

it('derives visible_until from duration_minutes on create', function () {
    $audience = Mockery::mock(AlertAudienceServiceInterface::class);
    $audience->shouldReceive('attributesForPersist')->andReturnUsing(fn ($creator, $data) => array_merge(
        $data,
        AlertAudienceDto::allRecipients()->toPersistenceArray(),
    ));

    $service = new PanelAlertService(app(\App\Repositories\Contracts\PanelAlertRepositoryInterface::class), $audience);

    $dto = $service->create([
        'text' => 'Timed alert',
        'severity' => 'medium',
        'visible_from' => '2026-06-08 10:00:00',
        'duration_minutes' => 90,
        // no explicit visible_until
    ], (string) Str::uuid());

    expect($dto->visibleUntil)->not->toBeNull();
    expect(Carbon::parse($dto->visibleUntil)->toDateTimeString())->toBe('2026-06-08 11:30:00');
});
