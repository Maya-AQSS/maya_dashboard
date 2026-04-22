<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FavoriteStoreRequest;
use App\Http\Resources\UserFavoriteApplicationResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserFavoriteApplicationController extends Controller
{
    public function index(User $user): AnonymousResourceCollection
    {
        $favorites = $user->favoriteApplications()->get();

        return UserFavoriteApplicationResource::collection($favorites);
    }

    public function store(FavoriteStoreRequest $request, User $user): UserFavoriteApplicationResource
    {
        $applicationId = $request->validated('application_id');

        $user->favoriteApplications()->syncWithoutDetaching([$applicationId]);

        $application = $user->favoriteApplications()->findOrFail($applicationId);

        return new UserFavoriteApplicationResource($application);
    }

    public function destroy(User $user, int $applicationId): JsonResponse
    {
        if (! $user->favoriteApplications()->where('application_id', $applicationId)->exists()) {
            abort(404);
        }

        $user->favoriteApplications()->detach($applicationId);

        return response()->json(null, 204);
    }
}
