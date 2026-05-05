<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FavoriteStoreRequest;
use App\Http\Resources\UserFavoriteApplicationResource;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserFavoriteApplicationController extends Controller
{
    use ResolvesKeycloakUser;

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveKeycloakUser($request);
        $favorites = $user->favoriteApplications()->get();

        return UserFavoriteApplicationResource::collection($favorites);
    }

    public function store(FavoriteStoreRequest $request): UserFavoriteApplicationResource
    {
        $user = $this->resolveKeycloakUser($request);
        $applicationId = $request->validated('application_id');

        $user->favoriteApplications()->syncWithoutDetaching([$applicationId]);

        $application = $user->favoriteApplications()->findOrFail($applicationId);

        return new UserFavoriteApplicationResource($application);
    }

    public function destroy(Request $request, string $user, string $applicationId): JsonResponse
    {
        unset($user);

        $resolved = $this->resolveKeycloakUser($request);
        $resolved->favoriteApplications()->detach((int) $applicationId);

        return response()->json(null, 204);
    }
}
