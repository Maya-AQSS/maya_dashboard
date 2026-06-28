<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\Models\PanelAlert;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use Cron\CronExpression;
use Illuminate\Support\Carbon;

/**
 * Re-materializes recurring panel alerts: when a recurring alert's cron is due,
 * shifts its visibility window to a fresh occurrence (visible_from = now,
 * visible_until = now + duration_minutes) so it surfaces again in the widget
 * and bell. The PanelAlertObserver picks up the window change and re-notifies.
 */
final class PanelAlertMaterializer
{
    public function __construct(
        private readonly PanelAlertRepositoryInterface $alerts,
    ) {}

    /**
     * @return int number of alerts re-materialized
     */
    public function run(?Carbon $now = null): int
    {
        $now = $now ?? now();
        $count = 0;

        foreach ($this->alerts->allRecurring() as $alert) {
            if ($this->isDue($alert, $now)) {
                $this->materialize($alert, $now);
                $count++;
            }
        }

        return $count;
    }

    public function isDue(PanelAlert $alert, Carbon $now): bool
    {
        if ($alert->schedule_cron === null || ! CronExpression::isValidExpression($alert->schedule_cron)) {
            return false;
        }

        $cron = new CronExpression($alert->schedule_cron);

        // Anchor: last time we materialized, else the row's creation time.
        $since = $alert->last_materialized_at ?? $alert->created_at ?? $now->copy()->subYear();

        // Due when a scheduled run falls in (since, now].
        $nextRun = $cron->getNextRunDate($since->toDateTimeString());

        return $nextRun <= $now;
    }

    private function materialize(PanelAlert $alert, Carbon $now): void
    {
        $duration = $alert->duration_minutes;

        $this->alerts->update($alert, [
            'visible_from' => $now,
            'visible_until' => $duration !== null ? $now->copy()->addMinutes((int) $duration) : null,
            'last_materialized_at' => $now,
        ]);
    }
}
