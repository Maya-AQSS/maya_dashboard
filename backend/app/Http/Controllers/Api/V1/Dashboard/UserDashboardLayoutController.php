<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DashboardLayoutUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserDashboardLayoutController extends Controller
{
    public function show(User $user): JsonResponse
    {
        $layout = $user->dashboardLayout ?? $user->dashboardLayout()->make(['layout' => []]);

        return response()->json([
            'layout' => $layout->layout,
            'updated_at' => $layout->updated_at,
        ]);
    }

    public function update(DashboardLayoutUpdateRequest $request, User $user): JsonResponse
    {
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
