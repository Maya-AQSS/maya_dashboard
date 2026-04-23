<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Evaluate alert rules every minute. Each rule decides internally whether
// enough time has passed since last_evaluated_at to re-run (honors schedule_cron).
Schedule::command('alerts:evaluate')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
