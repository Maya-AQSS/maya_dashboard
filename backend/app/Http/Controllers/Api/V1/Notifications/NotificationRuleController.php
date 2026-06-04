<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Notifications\ListNotificationRulesRequest;
use App\Http\Requests\Api\Notifications\StoreNotificationRuleRequest;
use App\Http\Requests\Api\Notifications\UpdateNotificationRuleRequest;
use App\Http\Resources\NotificationRuleResource;
use App\Services\Contracts\NotificationRuleServiceInterface;
use Illuminate\Http\JsonResponse;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

/**
 * CRUD for configurable scheduled-rule instances (level B). The owning service
 * reads its active rules via the v_notification_rules FDW view and evaluates them.
 */
class NotificationRuleController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly NotificationRuleServiceInterface $rules,
    ) {}

    public function index(ListNotificationRulesRequest $request): JsonResponse
    {
        $perPage = max(1, (int) ($request->validated('per_page') ?? 25));

        $page = $this->rules->paginate(
            $perPage,
            $request->validated('source_app') ?: null,
            $request->validated('evaluator_key') ?: null,
        );

        return $this->paginated($page, NotificationRuleResource::class, $request);
    }

    public function show(int $id): JsonResponse
    {
        return $this->okData(new NotificationRuleResource($this->rules->find($id)));
    }

    public function store(StoreNotificationRuleRequest $request): JsonResponse
    {
        $createdBy = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(new NotificationRuleResource($this->rules->create($request->validated(), $createdBy)), 201);
    }

    public function update(UpdateNotificationRuleRequest $request, int $id): JsonResponse
    {
        $updatedBy = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(new NotificationRuleResource($this->rules->update($id, $request->validated(), $updatedBy)));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->rules->delete($id);

        return $this->noContent();
    }
}
