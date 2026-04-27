<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use Maya\Auth\Concerns\ResolvesKeycloakUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DashboardLayoutUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDashboardLayoutController extends Controller
{
    use ResolvesKeycloakUser;

    public function show(Request $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $layout = $user->dashboardLayout ?? $user->dashboardLayout()->make(['layout' => []]);

        return response()->json([
            'layout' => $layout->layout,
            'updated_at' => $layout->updated_at,
        ]);
    }

    public function update(DashboardLayoutUpdateRequest $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $layout = $user->dashboardLayout()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'layout' => $request->validated('layout'),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'layout' => $layout->layout,
            'updated_at' => $layout->updated_at,
        ]);
    }
}
