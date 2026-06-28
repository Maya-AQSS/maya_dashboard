<?php

use App\Models\NotificationDefinition;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Notifications\NotificationIngestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Maya\Messaging\Publishers\LogPublisher;
use Maya\Messaging\Publishers\ResilientLogPublisher;

function makeNotificationIngestionService(
    NotificationRepositoryInterface $repo,
    ?ResilientLogPublisher $resilientLogPublisher = null,
): NotificationIngestionService {
    return new NotificationIngestionService(
        $repo,
        $resilientLogPublisher ?? new ResilientLogPublisher(Mockery::mock(LogPublisher::class)->shouldIgnoreMissing()),
        app(\App\Services\Contracts\NotificationDefinitionServiceInterface::class),
    );
}

beforeEach(function () {
    config([
        'messaging.app' => 'maya-dashboard',
        'broadcasting.default' => 'null',
    ]);
});

// ─── ingest ───────────────────────────────────────────────────────────────────

it('returns false when recipient_keycloak_id is empty', function () {
    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->never();
    $repo->shouldReceive('upsertByMessageId')->never();

    $service = makeNotificationIngestionService($repo);

    $result = $service->ingest([
        'app'                   => 'maya-authorization',
        'type'                  => 'test',
        'recipient_keycloak_id' => '',
        'title'                 => 'Title',
        'body'                  => 'Body',
        'channels'              => ['app'],
        'metadata'              => [],
    ], (string) Str::uuid());

    expect($result)->toBeFalse();
});

it('returns false when recipient user does not exist in DB', function () {
    $keycloakId = (string) Str::uuid();
    $messageId  = (string) Str::uuid();

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->once()->with($keycloakId)->andReturn(false);
    $repo->shouldReceive('upsertByMessageId')->never();

    $service = makeNotificationIngestionService($repo);

    $result = $service->ingest([
        'app'                   => 'maya-authorization',
        'type'                  => 'user.created',
        'recipient_keycloak_id' => $keycloakId,
        'title'                 => 'New User',
        'body'                  => 'Body',
        'channels'              => ['app'],
        'metadata'              => [],
        'created_at'            => '2026-05-10T12:00:00Z',
    ], $messageId);

    expect($result)->toBeFalse();
});

it('publishes LAR-DASH-004 when recipient user does not exist in DB', function () {
    $keycloakId = (string) Str::uuid();
    $messageId = (string) Str::uuid();

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->once()->with($keycloakId)->andReturn(false);

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
        ) use ($keycloakId): bool {
            return $severity === 'low'
                && $errorCode === 'LAR-DASH-004'
                && $app === 'maya-dashboard'
                && $metadata['recipient_keycloak_id'] === $keycloakId;
        });

    $service = makeNotificationIngestionService($repo, new ResilientLogPublisher($logPublisher));

    expect($service->ingest([
        'app' => 'maya-authorization',
        'type' => 'user.created',
        'recipient_keycloak_id' => $keycloakId,
        'title' => 'New User',
        'body' => 'Body',
        'channels' => ['app'],
        'metadata' => [],
    ], $messageId))->toBeFalse();
});

it('publishes LAR-DASH-003 when payload is malformed', function () {
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
        ): bool {
            return $severity === 'low'
                && $errorCode === 'LAR-DASH-003'
                && $app === 'maya-dashboard'
                && $metadata['payload_keys'] === ['title'];
        });

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->never();
    $repo->shouldReceive('upsertByMessageId')->never();

    $service = makeNotificationIngestionService($repo, new ResilientLogPublisher($logPublisher));

    expect($service->ingest(['title' => 'Missing required fields'], (string) Str::uuid()))->toBeFalse();
});

it('returns true and upserts when recipient user exists', function () {
    $keycloakId = (string) Str::uuid();
    $messageId  = (string) Str::uuid();

    $notification = new \App\Models\Notification(['recipient_id' => $keycloakId]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->once()->with($keycloakId)->andReturn(true);
    $repo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['recipient_id'] === $keycloakId && $args['title'] === 'New User'))
        ->andReturn($notification);

    $service = makeNotificationIngestionService($repo);

    $result = $service->ingest([
        'app'                   => 'maya-authorization',
        'type'                  => 'user.created',
        'recipient_keycloak_id' => $keycloakId,
        'title'                 => 'New User',
        'body'                  => 'Body',
        'channels'              => ['app'],
        'metadata'              => [],
        'created_at'            => '2026-05-10T12:00:00Z',
    ], $messageId);

    expect($result)->toBeTrue();
});

it('caches known user IDs — userExists called only once for repeated ingestion', function () {
    $keycloakId = (string) Str::uuid();
    $notification = new \App\Models\Notification(['recipient_id' => $keycloakId]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    // userExists should be called exactly once (second call uses in-memory cache)
    $repo->shouldReceive('userExists')->once()->with($keycloakId)->andReturn(true);
    $repo->shouldReceive('upsertByMessageId')->twice()->andReturn($notification);

    $service = makeNotificationIngestionService($repo);

    $payload = [
        'app'                   => 'maya-authorization',
        'type'                  => 'user.created',
        'recipient_keycloak_id' => $keycloakId,
        'title'                 => 'Title',
        'body'                  => 'Body',
        'channels'              => ['app'],
        'metadata'              => [],
    ];

    $service->ingest($payload, (string) Str::uuid());
    $service->ingest($payload, (string) Str::uuid());
});

it('uses now() when created_at is absent', function () {
    $keycloakId = (string) Str::uuid();
    $messageId  = (string) Str::uuid();
    $notification = new \App\Models\Notification(['recipient_id' => $keycloakId]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->andReturn(true);
    $repo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => isset($args['created_at'])))
        ->andReturn($notification);

    $service = makeNotificationIngestionService($repo);

    $result = $service->ingest([
        'app'                   => 'maya_auth',
        'type'                  => 'test',
        'recipient_keycloak_id' => $keycloakId,
        'title'                 => 'T',
        'body'                  => 'B',
        'channels'              => ['app'],
        'metadata'              => [],
        // no created_at
    ], $messageId);

    expect($result)->toBeTrue();
});

it('passes metadata and channels arrays correctly', function () {
    $keycloakId = (string) Str::uuid();
    $messageId  = (string) Str::uuid();
    $notification = new \App\Models\Notification(['recipient_id' => $keycloakId]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('userExists')->andReturn(true);
    $repo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['channels'] === ['app', 'email'] && $args['metadata'] === ['key' => 'val']))
        ->andReturn($notification);

    $service = makeNotificationIngestionService($repo);

    $service->ingest([
        'app'                   => 'maya-dms',
        'type'                  => 'doc.approved',
        'recipient_keycloak_id' => $keycloakId,
        'title'                 => 'Doc approved',
        'body'                  => null,
        'channels'              => ['app', 'email'],
        'metadata'              => ['key' => 'val'],
        'created_at'            => '2026-05-10T00:00:00Z',
    ], $messageId);
});

// ─── toggle gate + severity/url defaults (real DB) ──────────────────────────

describe('catalog gate and defaults', function () {
    uses(RefreshDatabase::class);

    it('drops a disabled notification type but acknowledges the message', function () {
        NotificationDefinition::factory()->disabled()->create(['key' => 'foo.disabled']);

        $repo = Mockery::mock(NotificationRepositoryInterface::class);
        $repo->shouldReceive('userExists')->never();
        $repo->shouldReceive('upsertByMessageId')->never();

        $service = makeNotificationIngestionService($repo);

        $result = $service->ingest([
            'app' => 'maya-dms',
            'type' => 'foo.disabled',
            'recipient_keycloak_id' => (string) Str::uuid(),
            'channels' => ['app'],
        ], (string) Str::uuid());

        expect($result)->toBeTrue(); // acknowledged (dropped, not error)
    });

    it('fills severity and url from the definition when payload omits them', function () {
        $keycloakId = (string) Str::uuid();
        $messageId = (string) Str::uuid();

        NotificationDefinition::factory()->create([
            'key' => 'document.published',
            'default_severity' => 'high',
            'url_template' => '/documents/{document_id}',
            'title_key' => 'notifications.document.published.title',
            'body_key' => 'notifications.document.published.body',
        ]);

        $captured = null;
        $repo = Mockery::mock(NotificationRepositoryInterface::class);
        $repo->shouldReceive('userExists')->andReturn(true);
        $repo->shouldReceive('upsertByMessageId')->once()->andReturnUsing(function ($mid, $args) use (&$captured, $keycloakId) {
            $captured = $args;

            return new \App\Models\Notification(['recipient_id' => $keycloakId]);
        });

        makeNotificationIngestionService($repo)->ingest([
            'app' => 'maya-dms',
            'type' => 'document.published',
            'recipient_keycloak_id' => $keycloakId,
            'channels' => ['app'],
            'params' => ['document_id' => 42],
        ], $messageId);

        expect($captured['severity'])->toBe('high');
        expect($captured['url'])->toBe('/documents/42');
        expect($captured['title_key'])->toBe('notifications.document.published.title');
        expect($captured['params'])->toBe(['document_id' => 42]);
    });
});
