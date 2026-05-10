<?php

namespace App\Console\Commands;

use App\DataTransferObjects\IncomingNotificationPayload;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Maya\Messaging\Support\AmqpConsumer;

class ConsumeNotifications extends Command
{
    protected $signature = 'notifications:consume {--queue=notifications.ingest}';

    protected $description = 'Consume notifications.ingest and persist each notification in the notifications table';

    public function handle(AmqpConsumer $consumer): int
    {
        $queue = (string) $this->option('queue');
        $this->info("Consuming from queue: {$queue}");

        $consumer->consume($queue, function (array $payload, $message) {
            $dto = IncomingNotificationPayload::fromArray($payload);

            $recipientId = $this->resolveRecipientId($dto->recipientKeycloakId);
            if ($recipientId === null) {
                $this->warn('Notification skipped: no valid recipient could be resolved from Odoo employees.');
                return;
            }

            Notification::updateOrCreate(
                ['message_id' => $message->get('message_id')],
                [
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
                ],
            );
        });

        return self::SUCCESS;
    }

    /**
     * Validates the Keycloak UUID against the FDW view (odoo.v_app_users).
     * Notifications for unknown employees are discarded — no local auto-provisioning.
     */
    private function resolveRecipientId(string $keycloakId): ?string
    {
        if ($keycloakId === '') {
            return null;
        }

        if (!User::query()->where('id', $keycloakId)->exists()) {
            $this->warn("Notification skipped: recipient {$keycloakId} not found in Odoo employees.");
            return null;
        }

        return $keycloakId;
    }
}
