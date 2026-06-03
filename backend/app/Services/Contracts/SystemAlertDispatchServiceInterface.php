<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\AlertRule;

interface SystemAlertDispatchServiceInterface
{
    /**
     * Publica la alerta de sistema (AMQP + notificaciones según audiencia de la regla).
     *
     * @param  array<string, mixed>  $context
     */
    public function dispatchTriggeredRule(AlertRule $rule, array $context): void;
}
