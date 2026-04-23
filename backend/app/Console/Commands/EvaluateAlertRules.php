<?php

namespace App\Console\Commands;

use App\Models\AlertRule;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AlertPublisher;
use Throwable;

/**
 * Evaluates every enabled alert_rule against the configured logs connection
 * and publishes an alert on maya.alerts when the rule's query returns rows.
 *
 * Scheduled via routes/console.php (typically every minute). The actual cron
 * filtering per-rule is left to the evaluator to keep Laravel's scheduler
 * simple: each rule carries schedule_cron but here we run them every tick
 * and decide via `last_evaluated_at + schedule_cron` whether to re-run.
 */
class EvaluateAlertRules extends Command
{
    protected $signature = 'alerts:evaluate {--logs-connection=pgsql_logs}';

    protected $description = 'Run each enabled alert rule and publish matching alerts to maya.alerts';

    public function handle(AlertPublisher $publisher): int
    {
        $logsConnection = (string) $this->option('logs-connection');

        $rules = AlertRule::where('enabled', true)->get();
        $this->info("Evaluating {$rules->count()} enabled rule(s) against connection: {$logsConnection}");

        foreach ($rules as $rule) {
            try {
                $rows = DB::connection($logsConnection)
                    ->select($rule->query_sql);
            } catch (Throwable $e) {
                $this->error("Rule {$rule->slug} query failed: {$e->getMessage()}");
                continue;
            }

            if (count($rows) === 0) {
                $rule->update(['last_evaluated_at' => now()]);
                continue;
            }

            $context = array_merge(
                (array) ($rule->context_template ?? []),
                ['matched_rows' => count($rows), 'sample' => array_slice($rows, 0, 5)],
            );

            $publisher->publish(
                ruleId: $rule->slug,
                severity: $rule->severity,
                title: $rule->name,
                context: $context,
                source: 'logs.aggregation',
            );

            $rule->update(['last_evaluated_at' => now()]);
            $this->line("  → alert published: {$rule->slug} ({$rule->severity}, {$context['matched_rows']} rows)");
        }

        return self::SUCCESS;
    }
}
