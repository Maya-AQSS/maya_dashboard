<?php

namespace App\Console\Commands;

use App\Services\Alerts\AlertIngestionService;
use Illuminate\Console\Command;
use Maya\Messaging\Support\AmqpConsumer;

class ConsumeAlerts extends Command
{
    protected $signature = 'alerts:consume {--queue=alerts.ingest}';

    protected $description = 'Consume alerts.ingest and persist each alert in the alerts table';

    public function handle(AmqpConsumer $consumer, AlertIngestionService $service): int
    {
        $queue = (string) $this->option('queue');
        $this->info("Consuming from queue: {$queue}");

        $consumer->consume($queue, function (array $payload, $message) use ($service) {
            $service->ingest($payload, (string) $message->get('message_id'));
        });

        return self::SUCCESS;
    }
}
