<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FavoriteStoreRequest;
use App\Http\Resources\UserFavoriteApplicationResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserFavoriteApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveUser($request);
        $favorites = $user->favoriteApplications()->get();

        return UserFavoriteApplicationResource::collection($favorites);
    }

    public function store(FavoriteStoreRequest $request): UserFavoriteApplicationResource
    {
        $user = $this->resolveUser($request);
        $applicationId = $request->validated('application_id');

        $user->favoriteApplications()->syncWithoutDetaching([$applicationId]);

        $application = $user->favoriteApplications()->findOrFail($applicationId);

        return new UserFavoriteApplicationResource($application);
    }

    public function destroy(Request $request, string $applicationId): JsonResponse
    {
        $user = $this->resolveUser($request);
        $user->favoriteApplications()->detach((int) $applicationId);

        return response()->json(null, 204);
    }

    private function resolveUser(Request $request): User
    {
        $jwtUser = $request->attributes->get('jwt_user');
        $keycloakId = $jwtUser['id'] ?? null;

        abort_if($keycloakId === null, 401, 'Unauthenticated');

        return User::firstOrCreate(
            ['keycloak_id' => $keycloakId],
            [
                'name'  => $jwtUser['name'] ?? $jwtUser['username'] ?? 'Unknown',
                'email' => $jwtUser['email'] ?? "{$keycloakId}@keycloak.local",
                'password' => '',
            ],
        );
    }
}
