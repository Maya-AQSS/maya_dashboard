<?php

declare(strict_types=1);

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channel Routes
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/**
 * Los canales se autorizan en `POST /api/v1/broadcasting/auth` (JwtMiddleware, audiencia
 * maya-dashboard). Los piden el dashboard y la barra lateral de las otras 4 apps, cada una con
 * el token de su SPA (D37: escuchan este Reverb, que es quien emite las notificaciones).
 *
 * Guard `jwt-claims` (AppServiceProvider): el usuario es un `Maya\Auth\Models\BaseJwtUser`
 * construido con los claims del token, cuyo identificador es el `sub`. No se busca en la vista
 * FDW `users`, así que la autorización no depende de la app que la pide ni de que el usuario
 * esté ya proyectado desde Odoo.
 *
 * Type-hint `Authenticatable` (no `App\Models\User`): con `App\Models\User` cada llamada a
 * `/api/v1/broadcasting/auth` acababa en un TypeError 500.
 */
$notificationChannelOptions = ['guards' => ['jwt-claims']];

/**
 * Canal compartido del dashboard para alertas de scope=dashboard|both.
 * Cualquier usuario autenticado puede escucharlo (alertas globales del panel).
 * Debe declararse ANTES del comodín para que 'dashboard' no se interprete como userId.
 */
Broadcast::channel('notifications.dashboard', function (Authenticatable $user): bool {
    return $user->getAuthIdentifier() !== null;
}, $notificationChannelOptions);

/**
 * Canal privado de notificaciones por usuario. El {userId} es el `sub` de Keycloak del
 * destinatario: solo se autoriza si coincide con el `sub` del token, para que nadie pueda
 * escuchar las notificaciones de otro.
 */
Broadcast::channel('notifications.{userId}', function (Authenticatable $user, string $userId): bool {
    return $user->getAuthIdentifier() === $userId;
}, $notificationChannelOptions);
