<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Alerts\ListAlertRulesRequest;
use App\Http\Requests\Api\Alerts\StoreAlertRuleRequest;
use App\Http\Requests\Api\Alerts\UpdateAlertRuleRequest;
use App\Http\Resources\AlertRuleResource;
use App\Services\Contracts\AlertRuleServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

class AlertRuleController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly AlertRuleServiceInterface $rules,
    ) {}

    public function index(ListAlertRulesRequest $request): JsonResponse
    {
        $page = $this->rules->paginate($request->toFilterDto());

        return $this->paginated($page, AlertRuleResource::class, $request);
    }

    public function show(Request $request, int $ruleId): JsonResponse
    {
        return response()->json(
            (new AlertRuleResource($this->rules->find($ruleId)))->resolve($request),
        );
    }

    public function store(StoreAlertRuleRequest $request): JsonResponse
    {
        return response()->json(
            (new AlertRuleResource($this->rules->create(
                $request->validated(),
                (string) $this->resolveKeycloakUser($request)->id,
            )))->resolve($request),
            201,
        );
    }

    public function update(UpdateAlertRuleRequest $request, int $ruleId): JsonResponse
    {
        return response()->json(
            (new AlertRuleResource(
                $this->rules->update(
                    $ruleId,
                    $request->validated(),
                    (string) $this->resolveKeycloakUser($request)->id,
                ),
            ))->resolve($request),
        );
    }

    public function destroy(int $ruleId): JsonResponse
    {
        $this->rules->delete($ruleId);

        return response()->json(null, 204);
    }
}
