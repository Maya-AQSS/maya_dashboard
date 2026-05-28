<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Alerts\ListAlertsRequest;
use App\Http\Resources\AlertResource;
use App\Services\Contracts\AlertServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class AlertController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly AlertServiceInterface $alerts,
    ) {}

    public function index(ListAlertsRequest $request): JsonResponse
    {
        $page = $this->alerts->paginate($request->toFilterDto());

        return $this->paginated($page, AlertResource::class, $request);
    }

    public function acknowledge(Request $request, int $alertId): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json(
            (new AlertResource($this->alerts->acknowledge($alertId, $userId)))->resolve($request),
        );
    }

    public function resolve(Request $request, int $alertId): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json(
            (new AlertResource($this->alerts->resolve($alertId, $userId)))->resolve($request),
        );
    }
}
