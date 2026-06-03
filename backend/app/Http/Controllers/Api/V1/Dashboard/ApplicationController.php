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
        $perPage = max(1, min((int) ($request->validated('per_page') ?? 100), 200));

        $page = $this->applications->listForUser((string) $user->id, $perPage);

        return $this->paginated($page, ApplicationResource::class, $request);
    }
}
