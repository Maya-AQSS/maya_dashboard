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

    private const SLUG_CACHE_REFRESH_EVERY = 100;

    public function handle(AmqpConsumer $consumer): int
    {
        $queue = (string) $this->option('queue');
        $this->info("Consuming from queue: {$queue}");

        // Pre-load valid slugs to avoid one SELECT per message (N+1).
        // Refreshed every SLUG_CACHE_REFRESH_EVERY messages to pick up rule changes.
        $validSlugs = $this->loadValidSlugs();
        $processed  = 0;

        $consumer->consume($queue, function (array $payload, $message) use (&$validSlugs, &$processed) {
            if (++$processed % self::SLUG_CACHE_REFRESH_EVERY === 0) {
                $validSlugs = $this->loadValidSlugs();
            }

            $ruleSlug = $payload['rule_id'] ?? null;
            if ($ruleSlug !== null && !isset($validSlugs[$ruleSlug])) {
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

    /** @return array<string, true> */
    private function loadValidSlugs(): array
    {
        return AlertRule::pluck('slug')->flip()->map(fn () => true)->all();
    }
}
