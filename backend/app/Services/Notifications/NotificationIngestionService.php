<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\IncomingNotificationPayload;
use App\Events\NotificationCreated;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Maya\Messaging\Publishers\ResilientLogPublisher;

class NotificationIngestionService implements NotificationIngestionServiceInterface
{
    /** TTL in seconds for the user-exists cache entry. */
    private const USER_CACHE_TTL = 300;

    private const CODE_MALFORMED_PAYLOAD = 'LAR-DASH-003';

    private const CODE_RECIPIENT_NOT_FOUND = 'LAR-DASH-004';

    public function __construct(
        private readonly NotificationRepositoryInterface $repo,
        private readonly ResilientLogPublisher $resilientLogPublisher,
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

        $notification = $this->repo->upsertByMessageId($messageId, [
            'app' => $dto->app,
            'type' => $dto->type,
            'recipient_id' => $recipientId,
            'title' => $dto->title,
            'body' => $dto->body,
            'channels' => $dto->channels,
            'metadata' => $dto->metadata,
            'created_at' => $dto->createdAt !== null
                ? Date::parse($dto->createdAt)
                : now(),
            'is_critical' => $dto->isCritical,
            'scope' => $dto->scope,
        ]);

        // El broadcast personal solo tiene sentido cuando hay recipient. Las
        // notificaciones de scope=dashboard se sirven vía polling al widget de
        // alertas críticas del dashboard.
        if ($notification->recipient_id !== null) {
            event(new NotificationCreated(
                notification: $notification->toArray(),
                userId: $notification->recipient_id,
            ));
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
