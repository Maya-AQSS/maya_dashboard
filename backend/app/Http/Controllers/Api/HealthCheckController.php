<?php

namespace App\Http\Controllers\Api;

use Maya\Http\Controllers\AbstractHealthCheckController;
use Maya\Http\Health\DatabaseHealthCheck;

class HealthCheckController extends AbstractHealthCheckController
{
    protected function checks(): array
    {
        return [
            new DatabaseHealthCheck(),
        ];
    }
}
