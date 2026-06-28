<?php

use App\DTOs\NotificationDto;
use App\Models\Notification;

function makeNotificationModel(array $attrs = []): Notification
{
    $model = Notification::make(array_merge([
        'message_id'   => 'uuid-1234',
        'app'          => 'maya-authorization',
        'type'         => 'user.created',
        'recipient_id' => 'user-uuid-456',
        'title'        => 'New User',
        'body'         => 'A new user was created',
        'severity'     => 'medium',
        'url'          => '/profile',
        'channels'     => ['app', 'email'],
        'metadata'     => ['key' => 'value'],
        'read_at'      => null,
    ], $attrs));
    $model->setAttribute('id', $attrs['id'] ?? 1);
    $model->setAttribute('created_at', $attrs['created_at'] ?? '2026-05-10 12:00:00');

    return $model;
}

it('creates NotificationDto from model with all fields', function () {
    $dto = NotificationDto::fromModel(makeNotificationModel());

    expect($dto->id)->toBe(1);
    expect($dto->messageId)->toBe('uuid-1234');
    expect($dto->app)->toBe('maya-authorization');
    expect($dto->type)->toBe('user.created');
    expect($dto->recipientId)->toBe('user-uuid-456');
    expect($dto->title)->toBe('New User');
    expect($dto->body)->toBe('A new user was created');
    expect($dto->severity)->toBe('medium');
    expect($dto->url)->toBe('/profile');
    expect($dto->channels)->toBe(['app', 'email']);
    expect($dto->metadata)->toBe(['key' => 'value']);
    expect($dto->readAt)->toBeNull();
    expect($dto->createdAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

it('derives is_critical from severity', function () {
    expect(NotificationDto::fromModel(makeNotificationModel(['severity' => 'critical']))->isCritical())->toBeTrue();
    expect(NotificationDto::fromModel(makeNotificationModel(['severity' => 'high']))->isCritical())->toBeTrue();
    expect(NotificationDto::fromModel(makeNotificationModel(['severity' => 'medium']))->isCritical())->toBeFalse();
    expect(NotificationDto::fromModel(makeNotificationModel(['severity' => 'info']))->isCritical())->toBeFalse();
});

it('resolves i18n keys to the requested locale with param interpolation', function () {
    $model = makeNotificationModel([
        'title'     => null,
        'body'      => null,
        'title_key' => 'notifications.document.published.title',
        'body_key'  => 'notifications.document.published.body',
        'params'    => ['document_title' => 'Acta 42'],
    ]);

    $dto = NotificationDto::fromModel($model);

    expect($dto->resolvedTitle('es'))->toBe('Documento publicado');
    expect($dto->resolvedBody('es'))->toBe('El documento Acta 42 ha sido publicado.');
    expect($dto->resolvedTitle('en'))->toBe('Document published');
    expect($dto->resolvedBody('en'))->toBe('The document Acta 42 has been published.');
});

it('falls back to free text when the i18n key is missing', function () {
    $model = makeNotificationModel([
        'title'     => 'Texto libre',
        'title_key' => 'notifications.unknown.key',
        'params'    => [],
    ]);

    expect(NotificationDto::fromModel($model)->resolvedTitle('es'))->toBe('Texto libre');
});

it('exposes keys and resolved text in toArray', function () {
    $model = makeNotificationModel([
        'title'     => null,
        'title_key' => 'notifications.document.published.title',
        'body_key'  => 'notifications.document.published.body',
        'params'    => ['document_title' => 'X'],
        'severity'  => 'high',
        'url'       => '/documents/7',
    ]);

    $arr = NotificationDto::fromModel($model)->toArray();

    expect($arr['title_key'])->toBe('notifications.document.published.title');
    expect($arr['severity'])->toBe('high');
    expect($arr['is_critical'])->toBeTrue();
    expect($arr['url'])->toBe('/documents/7');
    expect((array) $arr['params'])->toBe(['document_title' => 'X']);
});

it('formats read_at as ISO 8601 string when set', function () {
    $dto = NotificationDto::fromModel(makeNotificationModel(['read_at' => '2026-05-10 15:00:00']));

    expect($dto->readAt)->not->toBeNull();
    expect($dto->readAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

it('handles null channels by defaulting to empty array', function () {
    $dto = NotificationDto::fromModel(makeNotificationModel([
        'message_id' => null,
        'channels'   => null,
        'metadata'   => null,
    ]));

    expect($dto->channels)->toBe([]);
    expect($dto->metadata)->toBe([]);
    expect($dto->messageId)->toBeNull();
});

it('converts channel entries to strings', function () {
    $dto = NotificationDto::fromModel(makeNotificationModel(['channels' => [1, 2, 'email']]));

    expect($dto->channels)->toBe(['1', '2', 'email']);
});
