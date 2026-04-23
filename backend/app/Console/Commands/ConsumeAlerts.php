<?php

namespace App\Console\Commands;

use App\Models\Alert;
use App\Models\AlertRule;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Maya\Messaging\Support\AmqpConsumer;

class ConsumeAlerts extends Command
{
    protected $signature = 'alerts:consume {--queue=alerts.ingest}';

    protected $description = 'Consume alerts.ingest and persist each alert in the alerts table';

    public function handle(AmqpConsumer $consumer): int
    {
        $queue = (string) $this->option('queue');
        $this->info("Consuming from queue: {$queue}");

        $consumer->consume($queue, function (array $payload, $message) {
            $ruleSlug = $payload['rule_id'] ?? null;
            if ($ruleSlug !== null && !AlertRule::where('slug', $ruleSlug)->exists()) {
                $ruleSlug = null; // orphan alert — keep but decouple from FK
            }

            Alert::updateOrCreate(
                ['message_id' => $message->get('message_id')],
                [
                    'rule_slug'  => $ruleSlug,
                    'severity'   => $payload['severity'],
                    'title'      => $payload['title'],
                    'source'     => $payload['source'] ?? 'app.publish',
                    'context'    => $payload['context'] ?? [],
                    'created_at' => isset($payload['created_at'])
                        ? Carbon::parse($payload['created_at'])
                        : now(),
                ],
            );
        });

        return self::SUCCESS;
    }
}
