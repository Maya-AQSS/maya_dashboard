<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Re-materialize recurring panel alerts whose cron is due (shifts the
// visibility window and re-notifies recipients via the observer).
Schedule::command('panel-alerts:materialize')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
