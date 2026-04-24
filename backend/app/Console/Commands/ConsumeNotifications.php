<?php

namespace App\Console\Commands;

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
            $recipientId = $this->resolveRecipientId($payload);
            if ($recipientId === null) {
                $this->warn('Notification skipped: no recipient could be resolved.');
                return;
            }

            Notification::updateOrCreate(
                ['message_id' => $message->get('message_id')],
                [
                    'app'          => $payload['app'],
                    'type'         => $payload['type'],
                    'recipient_id' => $recipientId,
                    'title'        => $payload['title'],
                    'body'         => $payload['body'],
                    'channels'     => $payload['channels'] ?? ['app'],
                    'metadata'     => $payload['metadata'] ?? null,
                    'created_at'   => isset($payload['created_at'])
                        ? Carbon::parse($payload['created_at'])
                        : now(),
                ],
            );
        });

        return self::SUCCESS;
    }

    /**
     * Resolve the local users.id for the notification's recipient.
     *
     * Accepts either an explicit numeric `recipient_id` from the payload, or a
     * `recipient_keycloak_id` (UUID) under payload or metadata, which is
     * resolved via User::firstOrCreate so notifications can arrive before the
     * target user has logged into the dashboard.
     */
    private function resolveRecipientId(array $payload): ?int
    {
        $keycloakId = $payload['recipient_keycloak_id']
            ?? ($payload['metadata']['recipient_keycloak_id'] ?? null);

        if (is_string($keycloakId) && $keycloakId !== '') {
            $meta = is_array($payload['metadata'] ?? null) ? $payload['metadata'] : [];
            $user = User::firstOrCreate(
                ['keycloak_id' => $keycloakId],
                [
                    'name'     => $meta['recipient_name']     ?? 'User',
                    'email'    => $meta['recipient_email']    ?? $keycloakId . '@placeholder.local',
                    'password' => '',
                ],
            );
            return (int) $user->id;
        }

        if (isset($payload['recipient_id']) && (int) $payload['recipient_id'] > 0) {
            return (int) $payload['recipient_id'];
        }

        return null;
    }
}
