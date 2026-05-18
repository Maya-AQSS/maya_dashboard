<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FavoriteStoreRequest;
use App\Http\Resources\UserFavoriteApplicationResource;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Maya\Auth\Concerns\ResolvesKeycloakUser;

class UserFavoriteApplicationController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly UserFavoriteApplicationServiceInterface $favorites,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveKeycloakUser($request);
        $perPage = (int) $request->query('per_page', 100);
        $perPage = max(1, min($perPage, 200));

        return UserFavoriteApplicationResource::collection(
            $this->favorites->list($user, $perPage),
        );
    }

    public function store(FavoriteStoreRequest $request): UserFavoriteApplicationResource
    {
        $user = $this->resolveKeycloakUser($request);
        $applicationId = (int) $request->validated('application_id');

        return new UserFavoriteApplicationResource(
            $this->favorites->add($user, $applicationId),
        );
    }

    public function destroy(Request $request, string $user, string $applicationId): JsonResponse
    {
        unset($user);

        $resolved = $this->resolveKeycloakUser($request);
        $this->favorites->remove($resolved, (int) $applicationId);

        return response()->json(null, 204);
    }
}
