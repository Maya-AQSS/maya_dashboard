<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\PanelAlerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PanelAlerts\ListPanelAlertRulesRequest;
use App\Http\Requests\Api\PanelAlerts\StorePanelAlertRuleRequest;
use App\Http\Requests\Api\PanelAlerts\UpdatePanelAlertRuleRequest;
use App\Http\Resources\PanelAlertRuleResource;
use App\Services\Contracts\PanelAlertRuleServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class PanelAlertRuleController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly PanelAlertRuleServiceInterface $panelAlertRules,
    ) {}

    public function index(ListPanelAlertRulesRequest $request): JsonResponse
    {
        $perPage = max(1, min((int) ($request->validated('per_page') ?? 100), 200));

        $page = $this->panelAlertRules->paginate($perPage);

        return $this->paginated($page, PanelAlertRuleResource::class, $request);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->okData(new PanelAlertRuleResource($this->panelAlertRules->find($id)));
    }

    public function store(StorePanelAlertRuleRequest $request): JsonResponse
    {
        $createdBy = (string) $this->resolveKeycloakUser($request)->id;

        $dto = $this->panelAlertRules->create($request->validated(), $createdBy);

        return $this->okData(new PanelAlertRuleResource($dto), 201);
    }

    public function update(UpdatePanelAlertRuleRequest $request, int $id): JsonResponse
    {
        $updatedBy = (string) $this->resolveKeycloakUser($request)->id;

        $dto = $this->panelAlertRules->update($id, $request->validated(), $updatedBy);

        return $this->okData(new PanelAlertRuleResource($dto));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->panelAlertRules->delete($id);

        return $this->noContent();
    }
}
