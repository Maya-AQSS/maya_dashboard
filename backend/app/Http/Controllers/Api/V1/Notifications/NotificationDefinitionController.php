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
        $page = max(1, (int) ($request->validated('page') ?? 1));
        $perPage = max(1, min((int) ($request->validated('per_page') ?? 25), 100));
        $category = $request->validated('category') ?: null;
        $sourceApp = $request->validated('source_app') ?: null;
        $defaultSeverity = $request->validated('default_severity') ?: null;
        $search = $request->validated('search') ?: null;
        $sortBy = $request->validated('sort_by', 'label');
        $sortDir = $request->validated('sort_dir', 'asc');

        $paginated = $this->definitions->paginate(
            $page,
            $perPage,
            $category,
            $sourceApp,
            $defaultSeverity,
            $search,
            $sortBy,
            $sortDir,
        );

        return $this->paginated($paginated, NotificationDefinitionResource::class, $request);
    }

    public function update(UpdateNotificationDefinitionRequest $request, int $id): JsonResponse
    {
        $dto = $this->definitions->setEnabled($id, (bool) $request->validated('enabled'));

        return $this->okData(new NotificationDefinitionResource($dto));
    }
}
