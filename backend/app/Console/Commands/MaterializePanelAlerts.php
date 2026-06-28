<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\PanelAlerts\PanelAlertMaterializer;
use Illuminate\Console\Command;

class MaterializePanelAlerts extends Command
{
    protected $signature = 'panel-alerts:materialize';

    protected $description = 'Re-materialize recurring panel alerts whose cron schedule is due';

    public function handle(PanelAlertMaterializer $materializer): int
    {
        $count = $materializer->run();

        $this->info("Re-materialized {$count} recurring panel alert(s).");

        return self::SUCCESS;
    }
}
