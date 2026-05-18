<?php

use App\DTOs\NotificationDto;
use App\Models\Notification;

it('creates NotificationDto from model with all fields', function () {
    $model = Notification::make([
        'message_id'   => 'uuid-1234',
        'app'          => 'maya_authorization',
        'type'         => 'user.created',
        'recipient_id' => 'user-uuid-456',
        'title'        => 'New User',
        'body'         => 'A new user was created',
        'channels'     => ['app', 'email'],
        'metadata'     => ['key' => 'value'],
        'read_at'      => null,
        'created_at'   => '2026-05-10 12:00:00',
    ]);
    $model->setAttribute('id', 1);

    $dto = NotificationDto::fromModel($model);

    expect($dto->id)->toBe(1);
    expect($dto->messageId)->toBe('uuid-1234');
    expect($dto->app)->toBe('maya_authorization');
    expect($dto->type)->toBe('user.created');
    expect($dto->recipientId)->toBe('user-uuid-456');
    expect($dto->title)->toBe('New User');
    expect($dto->body)->toBe('A new user was created');
    expect($dto->channels)->toBe(['app', 'email']);
    expect($dto->metadata)->toBe(['key' => 'value']);
    expect($dto->readAt)->toBeNull();
    expect($dto->createdAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

it('formats read_at as ISO 8601 string when set', function () {
    $model = Notification::make([
        'message_id'   => 'uuid-5678',
        'app'          => 'maya_dms',
        'type'         => 'doc.approved',
        'recipient_id' => 'user-uuid',
        'title'        => 'Document approved',
        'body'         => null,
        'channels'     => ['app'],
        'metadata'     => [],
        'read_at'      => '2026-05-10 15:00:00',
        'created_at'   => '2026-05-10 12:00:00',
    ]);
    $model->setAttribute('id', 2);

    $dto = NotificationDto::fromModel($model);

    expect($dto->readAt)->not->toBeNull();
    expect($dto->readAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

it('handles null channels by defaulting to empty array', function () {
    $model = Notification::make([
        'message_id'   => null,
        'app'          => 'maya_logs',
        'type'         => 'alert.triggered',
        'recipient_id' => 'user-uuid',
        'title'        => 'Alert',
        'body'         => null,
        'channels'     => null,
        'metadata'     => null,
        'read_at'      => null,
        'created_at'   => '2026-05-10 12:00:00',
    ]);
    $model->setAttribute('id', 3);

    $dto = NotificationDto::fromModel($model);

    expect($dto->channels)->toBe([]);
    expect($dto->metadata)->toBe([]);
    expect($dto->messageId)->toBeNull();
});

it('converts channel entries to strings', function () {
    $model = Notification::make([
        'message_id'   => null,
        'app'          => 'maya_auth',
        'type'         => 'test',
        'recipient_id' => 'user-uuid',
        'title'        => 'Test',
        'body'         => null,
        'channels'     => [1, 2, 'email'],
        'metadata'     => [],
        'read_at'      => null,
        'created_at'   => '2026-05-10 12:00:00',
    ]);
    $model->setAttribute('id', 4);

    $dto = NotificationDto::fromModel($model);

    expect($dto->channels)->toBe(['1', '2', 'email']);
});

it('NotificationDto is immutable (readonly)', function () {
    $dto = new NotificationDto(
        id: 1,
        messageId: null,
        app: 'app',
        type: 'type',
        recipientId: 'uid',
        title: 'T',
        body: null,
        channels: [],
        metadata: [],
        readAt: null,
        createdAt: '2026-01-01T00:00:00+00:00',
    );

    expect(fn () => $dto->id = 999)->toThrow(Error::class);
});
