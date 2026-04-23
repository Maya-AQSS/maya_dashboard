<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveUser($request);

        $favoriteIds = $user
            ->favoriteApplications()
            ->pluck('applications.id')
            ->all();

        $applications = Application::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Application $app) use ($favoriteIds) {
                $app->is_favorite = in_array($app->id, $favoriteIds, true);
                return $app;
            });

        return ApplicationResource::collection($applications);
    }

    private function resolveUser(Request $request): User
    {
        $jwtUser = $request->attributes->get('jwt_user');
        $keycloakId = $jwtUser['id'] ?? null;

        abort_if($keycloakId === null, 401, 'Unauthenticated');

        return User::firstOrCreate(
            ['keycloak_id' => $keycloakId],
            [
                'name'     => $jwtUser['name']  ?? $jwtUser['username'] ?? 'Unknown',
                'email'    => $jwtUser['email'] ?? "{$keycloakId}@keycloak.local",
                'password' => '',
            ],
        );
    }
}
