<?php

/**
 * AMQP publisher↔consumer contract tests.
 *
 * Each test simulates the full wire round-trip:
 *   publisher builds payload → json_encode → json_decode (associative) → DTO::fromArray()
 *
 * This catches field-name mismatches between publisher and consumer DTO at the
 * class level, without requiring an AMQP broker or database.
 */

use App\DTOs\IncomingNotificationPayload;

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Simulate the AMQP wire round-trip: php array → JSON → associative array. */
function wire(array $payload): array
{
    return json_decode(
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        associative: true,
        flags: JSON_THROW_ON_ERROR,
    );
}

// ─── NotificationPublisher → IncomingNotificationPayload ─────────────────────

it('notification DTO parses publisher payload with all required fields', function () {
    // Exact payload shape from NotificationPublisher::send()
    $publisherPayload = wire([
        'app'                   => 'maya-authorization',
        'type'                  => 'user.created',
        'recipient_keycloak_id' => 'uuid-1234-abcd',
        'title'                 => 'Nuevo usuario creado',
        'body'                  => 'El usuario jdoe ha sido registrado.',
        'channels'              => ['app', 'email'],
        'metadata'              => (object) ['extra' => 'data'],
        'created_at'            => '2026-05-10T12:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($publisherPayload);

    expect($dto->app)->toBe('maya-authorization')
        ->and($dto->type)->toBe('user.created')
        ->and($dto->recipientKeycloakId)->toBe('uuid-1234-abcd')
        ->and($dto->title)->toBe('Nuevo usuario creado')
        ->and($dto->body)->toBe('El usuario jdoe ha sido registrado.')
        ->and($dto->channels)->toBe(['app', 'email'])
        ->and($dto->metadata)->toBe(['extra' => 'data'])
        ->and($dto->createdAt)->toBe('2026-05-10T12:00:00Z');
});

it('notification DTO parses publisher payload with empty metadata', function () {
    $payload = wire([
        'app'                   => 'maya-dms',
        'type'                  => 'document.approved',
        'recipient_keycloak_id' => 'uuid-5678-efgh',
        'title'                 => 'Documento aprobado',
        'body'                  => 'Tu documento ha sido aprobado.',
        'channels'              => ['app'],
        'metadata'              => (object) [],
        'created_at'            => '2026-05-10T13:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    // (object)[] → json {} → json_decode(assoc=true) → [] → is_array([]) === true,
    // so metadata is set to the empty array (NOT null).
    expect($dto->metadata)->toBe([]);
});

it('notification DTO uses "app" channel default when channels key missing', function () {
    $payload = wire([
        'app'                   => 'maya-logs',
        'type'                  => 'alert.triggered',
        'recipient_keycloak_id' => 'uuid-9999',
        'title'                 => 'Alerta',
        'body'                  => 'Cuerpo',
        'created_at'            => '2026-05-10T14:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    expect($dto->channels)->toBe(['app']);
});

it('notification DTO regression: recipient_id is NOT mapped (must use recipient_keycloak_id)', function () {
    // This test would have caught the original bug where publisher sent
    // 'recipient_id' instead of 'recipient_keycloak_id' (jedi-review CRITICAL #1).
    $payload = wire([
        'app'          => 'maya-authorization',
        'type'         => 'test',
        'recipient_id' => 'uuid-wrong-field',  // wrong field name
        'title'        => 'T',
        'body'         => 'B',
        'channels'     => ['app'],
        'metadata'     => (object) [],
        'created_at'   => '2026-05-10T00:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    // With the wrong field name the DTO receives no valid keycloak id
    expect($dto->recipientKeycloakId)->toBe('');
});

// ─── New fields: severity, url, i18n keys + params ───────────────────────────

it('notification DTO parses severity, url and i18n keys', function () {
    $payload = wire([
        'app'                   => 'maya-dms',
        'type'                  => 'document.published',
        'recipient_keycloak_id' => 'uuid-1',
        'title_key'             => 'notifications.document.published.title',
        'body_key'              => 'notifications.document.published.body',
        'params'                => (object) ['document_id' => 42, 'document_title' => 'Acta'],
        'severity'              => 'high',
        'url'                   => '/documents/42',
        'channels'              => ['app'],
        'created_at'            => '2026-05-10T12:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    expect($dto->titleKey)->toBe('notifications.document.published.title')
        ->and($dto->bodyKey)->toBe('notifications.document.published.body')
        ->and($dto->params)->toBe(['document_id' => 42, 'document_title' => 'Acta'])
        ->and($dto->severity)->toBe('high')
        ->and($dto->url)->toBe('/documents/42');
});

it('notification DTO normalizes empty params object to an array', function () {
    $payload = wire([
        'app'      => 'maya-dms',
        'type'     => 'document.published',
        'recipient_keycloak_id' => 'uuid-2',
        'params'   => (object) [],
        'channels' => ['app'],
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    expect($dto->params)->toBe([])
        ->and($dto->severity)->toBeNull()
        ->and($dto->url)->toBeNull();
});
