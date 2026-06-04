<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Notifications\ListNotificationDefinitionsRequest;
use App\Http\Requests\Api\Notifications\UpdateNotificationDefinitionRequest;
use App\Http\Resources\NotificationDefinitionResource;
use App\Services\Contracts\NotificationDefinitionServiceInterface;
use Illuminate\Http\JsonResponse;
use Maya\Http\Concerns\RespondsWithEnvelope;

/**
 * Catalog of system notification types shown in the Alerts panel, where an
 * admin enables/disables each type (the toggle is enforced at ingestion).
 */
class NotificationDefinitionController extends Controller
{
    use RespondsWithEnvelope;

    public function __construct(
        private readonly NotificationDefinitionServiceInterface $definitions,
    ) {}

    public function index(ListNotificationDefinitionsRequest $request): JsonResponse
    {
        $items = $this->definitions->list(
            $request->validated('category') ?: null,
            $request->validated('source_app') ?: null,
        );

        return $this->okData(NotificationDefinitionResource::collection($items));
    }

    public function update(UpdateNotificationDefinitionRequest $request, int $id): JsonResponse
    {
        $dto = $this->definitions->setEnabled($id, (bool) $request->validated('enabled'));

        return $this->okData(new NotificationDefinitionResource($dto));
    }
}
