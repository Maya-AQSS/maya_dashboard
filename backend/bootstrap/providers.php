<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use Maya\Platform\Providers\SharedPlatformServiceProvider;

return [
    AppServiceProvider::class,
    SharedPlatformServiceProvider::class,
];
