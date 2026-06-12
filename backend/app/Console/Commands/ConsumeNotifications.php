<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Contracts\NotificationIngestionServiceInterface;
use Maya\Messaging\Console\ConsumeQueueCommand;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * Consumidor AMQP de notificaciones (cola notifications.ingest).
 *
 * Hereda la política canónica de clasificación de errores de
 * {@see ConsumeQueueCommand} (shared-messaging-laravel):
 *   - UnrecoverableIngestionException → ACK/drop (payload inválido, sin reintento)
 *   - QueryException → NACK/retry (fallo de infraestructura)
 *   - Cualquier otro Throwable → log + report() + ACK/drop
 *
 * CAMBIO FUNCIONAL respecto a la política anterior (catch-all report + ACK):
 * los fallos de BD ahora se reintentan vía NACK — ver changes.md.
 */
class ConsumeNotifications extends ConsumeQueueCommand
{
    protected $signature = 'notifications:consume {--queue=notifications.ingest}';

    protected $description = 'Consume notifications.ingest and persist each notification in the notifications table';

    public function __construct(
        private readonly NotificationIngestionServiceInterface $ingestion,
    ) {
        parent::__construct();
    }

    public function queueName(): string
    {
        return (string) $this->option('queue');
    }

    public function ingest(array $payload, AMQPMessage $message): void
    {
        $this->ingestion->ingest($payload, (string) $message->get('message_id'));
    }
}
