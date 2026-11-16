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

// Cola de Laravel (Redis): solo lleva los reintentos de publicación en RabbitMQ
// (RetryAmqpPublishJob de shared-messaging-laravel). El worker de esta app consume RabbitMQ,
// no esa cola, así que la vacía el scheduler; sin esto los reintentos se quedaban en Redis
// sin procesar (plan de las apps, § 4.4, defecto 9). Los que aún esperan su backoff se
// recogen al minuto siguiente.
Schedule::command('queue:work --stop-when-empty --max-time=50 --memory=96')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
