<?php

namespace App\Console\Commands;

use App\Models\Notification;
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
            Notification::updateOrCreate(
                ['message_id' => $message->get('message_id')],
                [
                    'app'          => $payload['app'],
                    'type'         => $payload['type'],
                    'recipient_id' => (int) $payload['recipient_id'],
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
}
