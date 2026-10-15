<?php

declare(strict_types=1);

// § 4.4, defecto 9: el worker de esta app consume RabbitMQ, así que la cola de Laravel (los
// reintentos de publicación, RetryAmqpPublishJob) la vacía el scheduler.
it('vacía la cola de Laravel desde el scheduler', function () {
    $this->artisan('schedule:list')
        ->expectsOutputToContain('queue:work --stop-when-empty')
        ->assertSuccessful();
});
