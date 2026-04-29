<?php

namespace App\Http\Controllers\Api\V1\Internal;

use App\Http\Controllers\Concerns\ResolvesKeycloakUser;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserContextResource;
use App\Services\UserContextService;
use Illuminate\Http\Request;

class UserContextController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly UserContextService $service,
    ) {
    }

    /**
     * Obtiene el contexto del usuario.
     *
     * @param Request $request
     * @return UserContextResource
     */
    public function me(Request $request): UserContextResource
    {
        $user = $this->resolveKeycloakUser($request);
        $context = $this->service->build($user);

        return new UserContextResource($context);
    }
}
