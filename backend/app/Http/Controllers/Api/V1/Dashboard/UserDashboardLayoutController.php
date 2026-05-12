<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DashboardLayoutUpdateRequest;
use App\Models\UserDashboardLayout;
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
     */
    private function present(UserDashboardLayout $layout): JsonResponse
    {
        return response()->json([
            'layout'     => $layout->layout,
            'updated_at' => $layout->updated_at,
        ]);
    }
}
