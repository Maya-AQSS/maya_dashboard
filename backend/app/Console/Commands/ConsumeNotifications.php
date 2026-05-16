<?php
declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Contracts\NotificationIngestionServiceInterface;
use Illuminate\Console\Command;
use Maya\Messaging\Support\AmqpConsumer;

class ConsumeNotifications extends Command
{
    protected $signature = 'notifications:consume {--queue=notifications.ingest}';

    protected $description = 'Consume notifications.ingest and persist each notification in the notifications table';

    public function handle(AmqpConsumer $consumer, NotificationIngestionServiceInterface $ingestion): int
    {
        $queue = (string) $this->option('queue');
        $this->info("Consuming from queue: {$queue}");

        $consumer->consume($queue, function (array $payload, $message) use ($ingestion) {
            try {
                $ingestion->ingest($payload, (string) $message->get('message_id'));
            } catch (\Throwable $e) {
                report($e);
            }
        });

        return self::SUCCESS;
    }
}
