<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\IncomingNotificationPayload;
use App\Events\NotificationCreated;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Log;

class NotificationIngestionService implements NotificationIngestionServiceInterface
{
    /** TTL in seconds for the user-exists cache entry. */
    private const USER_CACHE_TTL = 300;

    public function __construct(
        private readonly NotificationRepositoryInterface $repo,
    ) {}

    public function ingest(array $payload, string $messageId): bool
    {
        try {
            $dto = IncomingNotificationPayload::fromArray($payload);
        } catch (\InvalidArgumentException $e) {
            Log::warning('NotificationIngestionService: dropping malformed payload (non-retryable)', [
                'error' => $e->getMessage(),
                'keys' => array_keys($payload),
            ]);

            return false; // indica mensaje no-recuperable al consumer
        }

        $recipientId = $this->resolveRecipientId($dto->recipientKeycloakId);
        if ($recipientId === null) {
            return false;
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
        ]);

        event(new NotificationCreated(
            notification: $notification->toArray(),
            userId: $notification->recipient_id,
        ));

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
            Log::warning('Notification skipped: recipient not found in users.', ['keycloak_id' => $keycloakId]);

            return null;
        }

        return $keycloakId;
    }
}
