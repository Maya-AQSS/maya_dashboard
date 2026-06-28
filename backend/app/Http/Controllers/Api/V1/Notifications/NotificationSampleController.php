<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Notifications\FireNotificationSampleRequest;
use App\Services\Contracts\NotificationSampleServiceInterface;
use Illuminate\Http\JsonResponse;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

/**
 * QA: fires a sample notification of a given type to the current user, so an
 * admin can preview any type from the dashboard ("Probar" buttons).
 */
class NotificationSampleController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly NotificationSampleServiceInterface $samples,
    ) {}

    public function fire(FireNotificationSampleRequest $request): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        $delivered = $this->samples->fireSample((string) $request->validated('key'), $userId);

        return $this->okData(['delivered' => $delivered]);
    }
}
