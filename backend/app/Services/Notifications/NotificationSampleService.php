<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\Repositories\Contracts\NotificationDefinitionRepositoryInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use App\Services\Contracts\NotificationSampleServiceInterface;
use Illuminate\Support\Str;

/**
 * QA harness: fires realistic sample notifications of any catalog type through
 * the normal ingestion path (gate + definition defaults + i18n + broadcast), so
 * every type can be seen end-to-end in the inbox/bell without performing the
 * real business action. Not for production use of real data.
 */
final class NotificationSampleService implements NotificationSampleServiceInterface
{
    /** Types delivered to the shared dashboard scope (no per-user recipient). */
    private const DASHBOARD_SCOPE_KEYS = ['logs.error_spike'];

    public function __construct(
        private readonly NotificationDefinitionRepositoryInterface $definitions,
        private readonly NotificationIngestionServiceInterface $ingestion,
    ) {}

    public function fireSample(string $key, ?string $recipientId): bool
    {
        // Return false immediately when the type is disabled so the API responds
        // with delivered:false — the ingestion path returns true for disabled
        // notifications (ACK for AMQP consumers), which would be misleading here.
        $definition = $this->definitions->findByKey($key);
        if ($definition !== null && ! $definition->enabled) {
            return false;
        }

        $isDashboard = in_array($key, self::DASHBOARD_SCOPE_KEYS, true);
        $scope = $isDashboard ? 'dashboard' : 'user';

        $payload = [
            'app' => (string) config('messaging.app'),
            'type' => $key,
            'recipient_keycloak_id' => $isDashboard ? '' : (string) $recipientId,
            'channels' => ['app'],
            'scope' => $scope,
            'params' => (object) $this->paramsFor($key),
            // severity / url / title_key / body_key are filled from the definition.
        ];

        return $this->ingestion->ingest($payload, 'sample:'.$key.':'.Str::uuid()->toString());
    }

    /**
     * @return array<string, bool>
     */
    public function fireAll(?string $recipientId): array
    {
        $results = [];

        foreach ($this->definitions->list(null, null) as $definition) {
            $results[$definition->key] = $this->fireSample($definition->key, $recipientId);
        }

        return $results;
    }

    /**
     * Synthetic params per type so i18n bodies and url templates interpolate.
     *
     * @return array<string, mixed>
     */
    private function paramsFor(string $key): array
    {
        return match (true) {
            $key === 'document.ownership_transferred' => [
                'document_id' => 'DOC-123',
                'document_title' => 'Acta de ejemplo',
                'actor_name' => 'Coordinador Ejemplo',
            ],
            str_starts_with($key, 'document.') => ['document_id' => 'DOC-123', 'document_title' => 'Acta de ejemplo', 'reason' => 'Formato incorrecto'],
            $key === 'template.ownership_transferred' => [
                'template_id' => 'TPL-7',
                'template_name' => 'Plantilla de ejemplo',
                'actor_name' => 'Coordinador Ejemplo',
            ],
            str_starts_with($key, 'template.') => ['template_id' => 'TPL-7', 'template_name' => 'Plantilla de ejemplo', 'version' => 2, 'document_id' => 'DOC-123'],
            $key === 'role.assigned', $key === 'role.revoked' => ['role_name' => 'Coordinador'],
            $key === 'log.comment_added' => ['log_id' => 'LOG-9'],
            $key === 'dms.validation_deadline_approaching' => ['document_id' => 'DOC-123', 'document_title' => 'Acta de ejemplo', 'deadline' => now()->addDays(3)->toDateString()],
            $key === 'dms.pending_validations_threshold' => ['count' => 12],
            $key === 'logs.error_spike' => ['count' => 42],
            default => [],
        };
    }
}
