<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\DTOs\UserDashboardLayoutDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DashboardLayoutUpdateRequest;
use App\Http\Resources\UserDashboardLayoutResource;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;

class UserDashboardLayoutController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly UserDashboardLayoutServiceInterface $layouts,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);

        return $this->present($this->layouts->getOrMake($user));
    }

    public function update(DashboardLayoutUpdateRequest $request): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);

        /** @var array<int, mixed> $layout */
        $layout = (array) $request->validated('layout');

        return $this->present($this->layouts->save($user, $layout));
    }

    /**
     * El contrato histórico del endpoint devuelve la representación plana
     * (`{layout, updated_at}`) sin el wrap `data` que añadiría un JsonResource.
     * UserDashboardLayoutResource::toArray() devuelve directamente layout + updated_at.
     */
    private function present(UserDashboardLayoutDto $dto): JsonResponse
    {
        return response()->json((new UserDashboardLayoutResource($dto))->toArray(request()));
    }
}
