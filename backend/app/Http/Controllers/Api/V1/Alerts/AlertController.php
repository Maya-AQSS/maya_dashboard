<?php

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Concerns\ResolvesKeycloakUser;
use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    use ResolvesKeycloakUser;

    public function index(Request $request): JsonResponse
    {
        $query = Alert::query()->with('rule')->orderByDesc('created_at');

        if ($request->boolean('active_only', true)) {
            $query->active();
        }
        if ($sev = $request->string('severity')->toString()) {
            $query->where('severity', $sev);
        }

        $perPage = min((int) $request->integer('per_page', 25), 100);

        return response()->json($query->paginate($perPage));
    }

    public function acknowledge(Request $request, int $alertId): JsonResponse
    {
        $userId = (int) $this->resolveKeycloakUser($request)->id;
        $alert = Alert::findOrFail($alertId);

        if ($alert->acknowledged_at === null) {
            $alert->update([
                'acknowledged_at' => now(),
                'acknowledged_by' => $userId,
            ]);
        }

        return response()->json($alert->refresh());
    }

    public function resolve(Request $request, int $alertId): JsonResponse
    {
        $userId = (int) $this->resolveKeycloakUser($request)->id;
        $alert = Alert::findOrFail($alertId);

        $alert->update([
            'resolved_at' => now(),
            'resolved_by' => $userId,
            'acknowledged_at' => $alert->acknowledged_at ?? now(),
            'acknowledged_by' => $alert->acknowledged_by ?? $userId,
        ]);

        return response()->json($alert->refresh());
    }
}
