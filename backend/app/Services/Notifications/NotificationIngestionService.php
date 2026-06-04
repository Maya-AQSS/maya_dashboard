<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\IncomingNotificationPayload;
use App\DTOs\NotificationDto;
use App\Events\NotificationCreated;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationDefinitionServiceInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use App\Support\NotificationContent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Maya\Messaging\Publishers\ResilientLogPublisher;

class NotificationIngestionService implements NotificationIngestionServiceInterface
{
    /** TTL in seconds for the user-exists cache entry. */
    private const USER_CACHE_TTL = 300;

    private const CODE_MALFORMED_PAYLOAD = 'LAR-DASH-003';

    private const CODE_RECIPIENT_NOT_FOUND = 'LAR-DASH-004';

    private const CODE_TYPE_DISABLED = 'LAR-DASH-005';

    public function __construct(
        private readonly NotificationRepositoryInterface $repo,
        private readonly ResilientLogPublisher $resilientLogPublisher,
        private readonly NotificationDefinitionServiceInterface $definitions,
    ) {}

    private function messagingAppSlug(): string
    {
        return (string) config('messaging.app');
    }

    public function ingest(array $payload, string $messageId): bool
    {
        try {
            $dto = IncomingNotificationPayload::fromArray($payload);
        } catch (\InvalidArgumentException $e) {
            $this->resilientLogPublisher->publishStructured(
                'low',
                $e->getMessage(),
                self::CODE_MALFORMED_PAYLOAD,
                [
                    'payload_keys' => array_keys($payload),
                ],
                $this->messagingAppSlug(),
            );

            return false; // indica mensaje no-recuperable al consumer
        }

        // Gate de toggle: si el tipo está desactivado en el catálogo, se descarta
        // (se confirma el mensaje para no reencolarlo). Claves sin definición se
        // permiten por defecto.
        if (! $this->definitions->isKeyEnabled($dto->type)) {
            $this->resilientLogPublisher->publishStructured(
                'low',
                'Notification dropped: type disabled.',
                self::CODE_TYPE_DISABLED,
                ['type' => $dto->type, 'app' => $dto->app],
                $this->messagingAppSlug(),
            );

            return true; // descartada por configuración, no es un error
        }

        $definition = $this->definitions->findByKey($dto->type);

        // scope=dashboard puede no llevar recipient (alertas globales). Para el
        // resto (user, both) el recipient es obligatorio y debe existir en BD.
        $isDashboardOnly = $dto->scope === 'dashboard';

        if ($isDashboardOnly && $dto->recipientKeycloakId === '') {
            $recipientId = null;
        } else {
            $recipientId = $this->resolveRecipientId($dto->recipientKeycloakId);
            if ($recipientId === null) {
                return false;
            }
        }

        // Defaults desde la definición cuando el payload los omite.
        $severity = $dto->severity
            ?? $definition?->defaultSeverity
            ?? ($dto->isCritical ? 'high' : 'info');

        $titleKey = $dto->titleKey ?? $definition?->titleKey;
        $bodyKey = $dto->bodyKey ?? $definition?->bodyKey;

        // URL: explícita del payload, o resuelta desde el url_template de la definición.
        $url = $dto->url
            ?? NotificationContent::resolveUrl($definition?->urlTemplate, $dto->params);

        $notificationModel = $this->repo->upsertByMessageId($messageId, [
            'app' => $dto->app,
            'type' => $dto->type,
            'recipient_id' => $recipientId,
            'title' => $dto->title !== '' ? $dto->title : null,
            'body' => $dto->body !== '' ? $dto->body : null,
            'title_key' => $titleKey,
            'body_key' => $bodyKey,
            'params' => $dto->params,
            'severity' => $severity,
            'url' => $url,
            'target_app' => $definition?->targetApp,
            'channels' => $dto->channels,
            'metadata' => $dto->metadata,
            'created_at' => $dto->createdAt !== null
                ? Date::parse($dto->createdAt)
                : now(),
            'scope' => $dto->scope,
        ]);

        // Convert model to DTO to avoid leaking Eloquent model.
        $notificationDto = NotificationDto::fromModel($notificationModel);

        // Broadcast: canal personal cuando hay recipient, y/o canal compartido
        // del dashboard para scope=dashboard|both (alertas globales en tiempo real).
        $hasRecipient = $notificationDto->recipientId !== '';
        $isShared = in_array($notificationDto->scope, ['dashboard', 'both'], true);

        if ($hasRecipient || $isShared) {
            // El broadcast es best-effort: la persistencia ya es la verdad. Un
            // fallo de Reverb (caído/credenciales) no debe abortar la ingestión.
            try {
                event(new NotificationCreated(
                    notification: $notificationDto->toArray(),
                    userId: $notificationDto->recipientId,
                    scope: (string) ($notificationDto->scope ?? 'user'),
                ));
            } catch (\Throwable $e) {
                $this->resilientLogPublisher->publishStructured(
                    'low',
                    'Notification persisted but broadcast failed: ' . $e->getMessage(),
                    'LAR-DASH-006',
                    ['type' => $dto->type],
                    $this->messagingAppSlug(),
                );
            }
        }

        return true;
    }

    private function resolveRecipientId(string $keycloakId): ?string
    {
        if ($keycloakId === '') {
            return null;
        }

        $cacheKey = 'notification_user_exists:' . $keycloakId;

        $exists = Cache::remember($cacheKey, self::USER_CACHE_TTL, function () use ($keycloakId): bool {
            return $this->repo->userExists($keycloakId);
        });

        if (! $exists) {
            $this->resilientLogPublisher->publishStructured(
                'low',
                'Notification skipped: recipient not found in users.',
                self::CODE_RECIPIENT_NOT_FOUND,
                ['recipient_keycloak_id' => $keycloakId],
                $this->messagingAppSlug(),
            );

            return null;
        }

        return $keycloakId;
    }
}
