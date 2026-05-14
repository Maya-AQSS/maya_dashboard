<?php

namespace App\Services\Notifications;

use App\DataTransferObjects\IncomingNotificationPayload;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class NotificationIngestionService
{
    /** In-memory cache of known user IDs for the lifetime of this consumer process. */
    private array $knownUserIds = [];

    public function __construct(
        private readonly NotificationRepositoryInterface $repo,
    ) {}

    public function ingest(array $payload, string $messageId): bool
    {
        $dto = IncomingNotificationPayload::fromArray($payload);

        $recipientId = $this->resolveRecipientId($dto->recipientKeycloakId);
        if ($recipientId === null) {
            return false;
        }

        $this->repo->upsertByMessageId($messageId, [
            'app'          => $dto->app,
            'type'         => $dto->type,
            'recipient_id' => $recipientId,
            'title'        => $dto->title,
            'body'         => $dto->body,
            'channels'     => $dto->channels,
            'metadata'     => $dto->metadata,
            'created_at'   => $dto->createdAt !== null
                ? Carbon::parse($dto->createdAt)
                : now(),
        ]);

        return true;
    }

    private function resolveRecipientId(string $keycloakId): ?string
    {
        if ($keycloakId === '') {
            return null;
        }

        if (isset($this->knownUserIds[$keycloakId])) {
            return $keycloakId;
        }

        if (! $this->repo->userExists($keycloakId)) {
            Log::warning('Notification skipped: recipient not found in users.', ['keycloak_id' => $keycloakId]);
            return null;
        }

        $this->knownUserIds[$keycloakId] = true;

        return $keycloakId;
    }
}
