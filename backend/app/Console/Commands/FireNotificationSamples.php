<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Contracts\NotificationSampleServiceInterface;
use Illuminate\Console\Command;

/**
 * QA harness: fire a sample of every notification type (or one) into a
 * recipient's inbox so all types can be verified end-to-end.
 */
class FireNotificationSamples extends Command
{
    protected $signature = 'notifications:fire-samples {--recipient= : Keycloak id of the recipient} {--only= : Fire only this type key}';

    protected $description = 'Dispara notificaciones de muestra de todos los tipos (o uno) a un destinatario';

    public function handle(NotificationSampleServiceInterface $samples): int
    {
        if (app()->isProduction()) {
            $this->error('No disponible en producción.');

            return self::FAILURE;
        }

        $recipient = (string) ($this->option('recipient') ?? '');
        if ($recipient === '') {
            $recipient = (string) (User::query()->where('is_active', true)->value('id') ?? '');
        }
        if ($recipient === '') {
            $this->error('No hay destinatario. Indica --recipient=<keycloak_id>.');

            return self::FAILURE;
        }

        $only = $this->option('only');

        if ($only) {
            $ok = $samples->fireSample((string) $only, $recipient);
            $this->line(($ok ? '✓' : '✗ (descartada)').' '.$only);

            return self::SUCCESS;
        }

        $results = $samples->fireAll($recipient);
        foreach ($results as $key => $ok) {
            $this->line(($ok ? '✓' : '✗ (descartada/disabled)').' '.$key);
        }
        $this->info('Disparadas '.count(array_filter($results)).'/'.count($results).' a '.$recipient);

        return self::SUCCESS;
    }
}
