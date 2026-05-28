<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\PanelAlerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PanelAlerts\ListPanelAlertsRequest;
use App\Http\Requests\Api\PanelAlerts\StorePanelAlertRequest;
use App\Http\Requests\Api\PanelAlerts\UpdatePanelAlertRequest;
use App\Http\Resources\PanelAlertResource;
use App\Services\Contracts\PanelAlertServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class PanelAlertController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly PanelAlertServiceInterface $panelAlerts,
    ) {}

    public function index(ListPanelAlertsRequest $request): JsonResponse
    {
        $perPage = max(1, (int) ($request->validated('per_page') ?? 25));
        $severity = $request->validated('severity') ?: null;
        $search = $request->validated('search') ?: null;
        $includeExpired = (bool) ($request->validated('include_expired') ?? false);
        $sortBy = (string) ($request->validated('sort_by') ?? 'created_at');
        $sortDir = (string) ($request->validated('sort_dir') ?? 'desc');

        $page = $this->panelAlerts->paginate($perPage, $severity, $search, $includeExpired, $sortBy, $sortDir);

        return $this->paginated($page, PanelAlertResource::class, $request);
    }

    public function activeForWidget(Request $request): JsonResponse
    {
        $alerts = array_map(
            fn ($dto) => (new PanelAlertResource($dto))->resolve($request),
            $this->panelAlerts->activeForWidget(20),
        );

        return $this->okData(['alerts' => $alerts]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->okData(new PanelAlertResource($this->panelAlerts->find($id)));
    }

    public function store(StorePanelAlertRequest $request): JsonResponse
    {
        $createdBy = (string) $this->resolveKeycloakUser($request)->id;

        $dto = $this->panelAlerts->create($request->validated(), $createdBy);

        return $this->okData(new PanelAlertResource($dto), 201);
    }

    public function update(UpdatePanelAlertRequest $request, int $id): JsonResponse
    {
        $dto = $this->panelAlerts->update($id, $request->validated());

        return $this->okData(new PanelAlertResource($dto));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->panelAlerts->delete($id);

        return $this->noContent();
    }
}
