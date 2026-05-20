<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FavoriteStoreRequest;
use App\Http\Resources\UserFavoriteApplicationResource;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class UserFavoriteApplicationController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly UserFavoriteApplicationServiceInterface $favorites,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $perPage = (int) $request->query('per_page', 100);
        $perPage = max(1, min($perPage, 200));

        $page = $this->favorites->list($user, $perPage);

        return $this->paginated($page, UserFavoriteApplicationResource::class, $request);
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
