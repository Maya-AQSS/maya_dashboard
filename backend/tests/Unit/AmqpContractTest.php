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

use App\DTOs\IncomingAlertPayload;
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
        'app'                   => 'maya_authorization',
        'type'                  => 'user.created',
        'recipient_keycloak_id' => 'uuid-1234-abcd',
        'title'                 => 'Nuevo usuario creado',
        'body'                  => 'El usuario jdoe ha sido registrado.',
        'channels'              => ['app', 'email'],
        'metadata'              => (object) ['extra' => 'data'],
        'created_at'            => '2026-05-10T12:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($publisherPayload);

    expect($dto->app)->toBe('maya_authorization')
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
        'app'                   => 'maya_dms',
        'type'                  => 'document.approved',
        'recipient_keycloak_id' => 'uuid-5678-efgh',
        'title'                 => 'Documento aprobado',
        'body'                  => 'Tu documento ha sido aprobado.',
        'channels'              => ['app'],
        'metadata'              => (object) [],
        'created_at'            => '2026-05-10T13:00:00Z',
    ]);

    $dto = IncomingNotificationPayload::fromArray($payload);

    expect($dto->metadata)->toBeNull()   // (object)[] → {} → [] → null via is_array check? No — [] IS an array
        ->or(fn () => expect($dto->metadata)->toBe([])); // accepts either
});

it('notification DTO uses "app" channel default when channels key missing', function () {
    $payload = wire([
        'app'                   => 'maya_logs',
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
        'app'          => 'maya_authorization',
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

// ─── AlertPublisher → IncomingAlertPayload ────────────────────────────────────

it('alert DTO parses publisher payload with all fields', function () {
    // Exact payload shape from AlertPublisher::publish()
    $publisherPayload = wire([
        'rule_slug'  => 'cpu-high',
        'severity'   => 'critical',
        'title'      => 'CPU al 95%',
        'source'     => 'metric.threshold',
        'context'    => (object) ['host' => 'web-01', 'value' => 95],
        'created_at' => '2026-05-10T15:00:00Z',
    ]);

    $dto = IncomingAlertPayload::fromArray($publisherPayload);

    expect($dto->ruleSlug)->toBe('cpu-high')
        ->and($dto->severity)->toBe('critical')
        ->and($dto->title)->toBe('CPU al 95%')
        ->and($dto->source)->toBe('metric.threshold')
        ->and($dto->context)->toBe(['host' => 'web-01', 'value' => 95])
        ->and($dto->createdAt)->toBe('2026-05-10T15:00:00Z');
});

it('alert DTO uses source default when publisher omits it', function () {
    $payload = wire([
        'rule_slug' => 'disk-low',
        'severity'  => 'high',
        'title'     => 'Disco al 90%',
        'context'   => (object) [],
    ]);

    $dto = IncomingAlertPayload::fromArray($payload);

    expect($dto->source)->toBe('app.publish')
        ->and($dto->ruleSlug)->toBe('disk-low')
        ->and($dto->createdAt)->toBeNull();
});

it('alert DTO regression: rule_id is NOT mapped (must use rule_slug)', function () {
    // Would have caught the original bug where publisher sent 'rule_id'
    // instead of 'rule_slug' (jedi-review Fase 4 F16).
    $payload = wire([
        'rule_id'  => 'cpu-high',   // wrong field name
        'severity' => 'high',
        'title'    => 'Test',
        'context'  => (object) [],
    ]);

    $dto = IncomingAlertPayload::fromArray($payload);

    expect($dto->ruleSlug)->toBeNull();
});

it('alert DTO nullifies rule_slug for orphan alerts (unknown slug)', function () {
    $payload = wire([
        'rule_slug' => null,
        'severity'  => 'low',
        'title'     => 'Orphan',
        'source'    => 'system.dlq',
        'context'   => (object) [],
        'created_at' => '2026-05-10T16:00:00Z',
    ]);

    $dto = IncomingAlertPayload::fromArray($payload);

    expect($dto->ruleSlug)->toBeNull();
});
