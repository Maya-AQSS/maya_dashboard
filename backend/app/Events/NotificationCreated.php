<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Emitido inmediatamente (ShouldBroadcastNow) tras persistir una nueva
 * notificación en BD, para que el frontend la reciba por WebSocket sin
 * pasar por la cola de broadcasting.
 *
 * Canal: private-notifications.{userId}   (Keycloak UUID del destinatario)
 * Evento JS: notification.created
 */
final class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $notification  Payload serializado de la notificación persistida.
     * @param  string  $userId  Keycloak UUID del destinatario ('' si solo scope=dashboard).
     * @param  string  $scope  user | dashboard | both — decide los canales de emisión.
     */
    public function __construct(
        private readonly array $notification,
        private readonly string $userId,
        private readonly string $scope = 'user',
    ) {}

    /**
     * Personal channel for the recipient (when present) and/or the shared
     * dashboard channel for scope=dashboard|both (fixes the previous
     * polling-only delivery of global alerts).
     *
     * @return list<Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->userId !== '') {
            $channels[] = new PrivateChannel('notifications.'.$this->userId);
        }

        if ($this->scope === 'dashboard' || $this->scope === 'both') {
            $channels[] = new PrivateChannel('notifications.dashboard');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return $this->notification;
    }
}
