<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Services\Contracts\ApplicationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Maya\Auth\Concerns\ResolvesKeycloakUser;

class ApplicationController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly ApplicationServiceInterface $applications,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveKeycloakUser($request);

        return ApplicationResource::collection(
            $this->applications->listForUser($user),
        );
    }
}
