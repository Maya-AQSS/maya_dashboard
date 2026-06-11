<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Application\ListApplicationsRequest;
use App\Http\Resources\ApplicationResource;
use App\Services\Contracts\ApplicationServiceInterface;
use Illuminate\Http\JsonResponse;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class ApplicationController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly ApplicationServiceInterface $applications,
    ) {}

    public function index(ListApplicationsRequest $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $page = max(1, (int) ($request->validated('page') ?? 1));
        $perPage = max(1, min((int) ($request->validated('per_page') ?? 25), 200));
        $search = $request->validated('search');
        $favorite = $request->validated('favorite');
        $sortBy = $request->validated('sort_by', 'name');
        $sortDir = $request->validated('sort_dir', 'asc');

        $paginated = $this->applications->listForUserWithFilters(
            (string) $user->id,
            $page,
            $perPage,
            $search,
            $favorite,
            $sortBy,
            $sortDir,
        );

        return $this->paginated($paginated, ApplicationResource::class, $request);
    }
}
