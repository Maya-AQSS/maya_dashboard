<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\PanelAlert;

interface PanelAlertNotificationServiceInterface
{
    /**
     * Notifica a todos los usuarios activos que hay una nueva alerta del panel.
     *
     * @return int Número de destinatarios a los que se publicó correctamente.
     */
    public function notifyUsersOfNewAlert(PanelAlert $alert): int;
}
