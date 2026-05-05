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
                $this->warn('Notification skipped: no valid recipient could be resolved from Odoo employees.');
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
     * Resolve the Keycloak UUID to use as recipient_id (varchar).
     *
     * Accepts `recipient_keycloak_id` from the payload or metadata.
     * The UUID is validated against the FDW view (odoo.v_app_users) to ensure
     * the recipient is an active employee. Notifications for unknown employees
     * are discarded (ack + log) — no local auto-provisioning.
     */
    private function resolveRecipientId(array $payload): ?string
    {
        $keycloakId = $payload['recipient_keycloak_id']
            ?? ($payload['metadata']['recipient_keycloak_id'] ?? null);

        if (is_string($keycloakId) && $keycloakId !== '') {
            $exists = User::query()->where('id', $keycloakId)->exists();
            if (!$exists) {
                $this->warn("Notification skipped: recipient {$keycloakId} not found in Odoo employees.");
                return null;
            }
            return $keycloakId;
        }

        return null;
    }
}
