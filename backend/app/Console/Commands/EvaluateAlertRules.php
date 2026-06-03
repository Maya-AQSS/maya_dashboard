<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use Cron\CronExpression;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\Contracts\SystemAlertDispatchServiceInterface;
use Throwable;

/**
 * Evaluates every enabled alert_rule against the configured logs connection
 * and publishes an alert on maya.alerts when the rule's query returns rows.
 *
 * Scheduled via routes/console.php (every minute). Each rule's schedule_cron
 * controls its own evaluation cadence: the rule is skipped if it was evaluated
 * more recently than the cron expression would require.
 */
class EvaluateAlertRules extends Command
{
    protected $signature = 'alerts:evaluate {--logs-connection=pgsql_logs}';

    protected $description = 'Run each enabled alert rule and publish matching alerts to maya.alerts';

    public function handle(
        SystemAlertDispatchServiceInterface $dispatch,
        AlertRuleRepositoryInterface $ruleRepo,
    ): int {
        $logsConnection = (string) $this->option('logs-connection');
        $now = now();

        $rules = $ruleRepo->cursorActive();
        $this->info("Evaluating enabled rule(s) against connection: {$logsConnection}");

        $evaluatedIds = [];

        foreach ($rules as $rule) {
            if ($this->isDue($rule, $now) === false) {
                $this->line("  ↷ skipping {$rule->slug} (not due yet per schedule_cron)");

                continue;
            }

            try {
                // Wrap in a transaction so SET LOCAL applies to both statements.
                $rows = DB::connection($logsConnection)->transaction(function () use ($logsConnection, $rule) {
                    DB::connection($logsConnection)->statement("SET LOCAL statement_timeout = '5s'");

                    return DB::connection($logsConnection)->select($rule->query_sql);
                });
            } catch (Throwable $e) {
                $this->error("Rule {$rule->slug} query failed: {$e->getMessage()}");

                continue;
            }

            $evaluatedIds[] = $rule->id;

            if (count($rows) === 0) {
                continue;
            }

            $template = (array) ($rule->context_template ?? []);
            $context = array_merge(
                $template,
                [
                    'matched_rows' => count($rows),
                    'sample' => $this->buildSafeSample($rows, $template),
                ],
            );
            // sample_columns is metadata for redaction, not part of the alert payload.
            unset($context['sample_columns']);

            $dispatch->dispatchTriggeredRule($rule, $context);

            $this->line("  → alert published: {$rule->slug} ({$rule->severity}, {$context['matched_rows']} rows)");
        }

        if ($evaluatedIds !== []) {
            $ruleRepo->markEvaluated($evaluatedIds, $now);
        }

        return self::SUCCESS;
    }

    /**
     * Restrict the sample published to the AMQP bus to the column allowlist
     * declared in the rule's context_template.sample_columns. If no allowlist
     * is provided, only the row count is published — never raw row values.
     *
     * @param  list<object>  $rows  Raw rows returned by DB::select() (stdClass objects).
     * @param  array<string, mixed>  $template  The rule's context_template, may contain `sample_columns`.
     * @return list<array<string, mixed>>
     */
    private function buildSafeSample(array $rows, array $template): array
    {
        $allowed = $template['sample_columns'] ?? null;
        if (! is_array($allowed) || $allowed === []) {
            return [];
        }
        $allowed = array_values(array_filter(array_map('strval', $allowed)));

        $sample = [];
        foreach (array_slice($rows, 0, 5) as $row) {
            $assoc = (array) $row;
            $filtered = [];
            foreach ($allowed as $column) {
                if (array_key_exists($column, $assoc)) {
                    $filtered[$column] = $assoc[$column];
                }
            }
            $sample[] = $filtered;
        }

        return $sample;
    }

    /**
     * Returns true if the rule should run now, based on schedule_cron and last_evaluated_at.
     * If schedule_cron is not set, the rule always runs.
     */
    private function isDue(AlertRule $rule, Carbon $now): bool
    {
        if (empty($rule->schedule_cron)) {
            return true;
        }

        if ($rule->last_evaluated_at === null) {
            return true;
        }

        try {
            $cron = new CronExpression($rule->schedule_cron);
            // The previous run time is the last time the cron expression was due before now.
            $previousRunTime = Carbon::instance($cron->getPreviousRunDate($now->toDateTime()));

            // If we already evaluated after the previous run time, we're not due yet.
            return $rule->last_evaluated_at->lt($previousRunTime);
        } catch (Throwable) {
            // Malformed cron expression — run always to avoid silent gaps.
            return true;
        }
    }
}
