<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Services\Contracts\ApplicationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class ApplicationController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly ApplicationServiceInterface $applications,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $perPage = (int) $request->query('per_page', 100);
        $perPage = max(1, min($perPage, 200));

        $page = $this->applications->listForUser($user, $perPage);

        return $this->paginated($page, ApplicationResource::class, $request);
    }
}
