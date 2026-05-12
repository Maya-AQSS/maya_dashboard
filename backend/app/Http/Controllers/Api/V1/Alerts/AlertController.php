<?php

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AlertServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;

class AlertController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly AlertServiceInterface $alerts,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 25), 100);
        $severity = $request->string('severity')->toString() ?: null;

        // El frontend (`useSystemAlerts`) lee `page?.data` del LengthAwarePaginator.
        return response()->json(
            $this->alerts->paginate(
                $request->boolean('active_only', true),
                $severity,
                $perPage > 0 ? $perPage : 25,
            ),
        );
    }

    public function acknowledge(Request $request, int $alertId): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json($this->alerts->acknowledge($alertId, $userId));
    }

    public function resolve(Request $request, int $alertId): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json($this->alerts->resolve($alertId, $userId));
    }
}
