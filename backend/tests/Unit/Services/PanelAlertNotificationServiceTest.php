<?php

use App\Models\PanelAlert;
use App\Models\User;
use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use App\Services\PanelAlerts\PanelAlertNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Maya\Messaging\Publishers\LogPublisher;
use Maya\Messaging\Publishers\NotificationPublisher;
use Maya\Messaging\Publishers\ResilientLogPublisher;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['messaging.app' => 'maya-dashboard']);
});

it('notifies every active user when a panel alert is created', function () {
    $userA = (string) Str::uuid();
    $userB = (string) Str::uuid();

    $alert = PanelAlert::forceCreate([
        'text' => 'Mantenimiento programado',
        'severity' => 'high',
        'visible_from' => now(),
        'source' => 'manual',
        'created_by' => $userA,
        'notify_all' => true,
    ]);

    $notificationPublisher = Mockery::mock(NotificationPublisher::class);
    $notificationPublisher->shouldReceive('send')->twice();

    $audience = Mockery::mock(AlertAudienceRepositoryInterface::class);
    $audience->shouldReceive('cursorRecipientIdsForAudience')->once()->andReturn(
        (function () use ($userA, $userB) {
            yield $userA;
            yield $userB;
        })(),
    );

    $service = new PanelAlertNotificationService(
        $notificationPublisher,
        new ResilientLogPublisher(Mockery::mock(LogPublisher::class)->shouldIgnoreMissing()),
        $audience,
    );

    expect($service->notifyUsersOfNewAlert($alert))->toBe(2);
});

it('uses panel_alert.rule type for rule-sourced alerts', function () {
    $userId = (string) Str::uuid();

    $alert = PanelAlert::forceCreate([
        'text' => 'Umbral superado',
        'severity' => 'medium',
        'visible_from' => now(),
        'source' => 'rule',
        'created_by' => $userId,
        'notify_all' => true,
    ]);

    $notificationPublisher = Mockery::mock(NotificationPublisher::class);
    $notificationPublisher->shouldReceive('send')
        ->once()
        ->withArgs(fn (
            string $type,
            ?string $recipientId,
            string $title,
            string $body,
            array $channels,
            array $metadata,
            ?string $app,
            ?string $createdAt,
            bool $isCritical,
            string $scope,
        ): bool => $type === 'panel_alert.rule'
            && $isCritical === false
            && $recipientId === $userId);

    $audience = Mockery::mock(AlertAudienceRepositoryInterface::class);
    $audience->shouldReceive('cursorRecipientIdsForAudience')->once()->andReturn(
        (function () use ($userId) {
            yield $userId;
        })(),
    );

    $service = new PanelAlertNotificationService(
        $notificationPublisher,
        new ResilientLogPublisher(Mockery::mock(LogPublisher::class)->shouldIgnoreMissing()),
        $audience,
    );

    expect($service->notifyUsersOfNewAlert($alert))->toBe(1);
});

it('publishes structured log to maya.logs when notification publish fails for a user', function () {
    $userId = (string) Str::uuid();

    $alert = PanelAlert::forceCreate([
        'text' => 'Alerta con fallo parcial',
        'severity' => 'low',
        'visible_from' => now(),
        'source' => 'manual',
        'created_by' => $userId,
        'notify_all' => true,
    ]);

    $notificationPublisher = Mockery::mock(NotificationPublisher::class);
    $notificationPublisher->shouldReceive('send')
        ->once()
        ->andThrow(new RuntimeException('AMQP unavailable'));

    $logPublisher = Mockery::mock(LogPublisher::class);
    $logPublisher->shouldReceive('publish')
        ->once()
        ->withArgs(function (
            string $severity,
            string $message,
            ?string $errorCode,
            ?string $file,
            ?int $line,
            array $metadata,
            ?string $app,
        ) use ($alert, $userId): bool {
            return $severity === 'medium'
                && $message === 'AMQP unavailable'
                && $errorCode === 'LAR-DASH-001'
                && $app === 'maya-dashboard'
                && $metadata['panel_alert_id'] === $alert->id
                && $metadata['recipient_keycloak_id'] === $userId
                && $metadata['type'] === 'panel_alert.manual';
        });

    $audience = Mockery::mock(AlertAudienceRepositoryInterface::class);
    $audience->shouldReceive('cursorRecipientIdsForAudience')->once()->andReturn(
        (function () use ($userId) {
            yield $userId;
        })(),
    );

    $service = new PanelAlertNotificationService(
        $notificationPublisher,
        new ResilientLogPublisher($logPublisher),
        $audience,
    );

    expect($service->notifyUsersOfNewAlert($alert))->toBe(0);
});
