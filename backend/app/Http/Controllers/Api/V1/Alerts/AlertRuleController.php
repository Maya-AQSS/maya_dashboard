<?php

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Alerts\StoreAlertRuleRequest;
use App\Http\Requests\Api\Alerts\UpdateAlertRuleRequest;
use App\Http\Resources\AlertRuleResource;
use App\Services\Contracts\AlertRuleServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertRuleController extends Controller
{
    public function __construct(
        private readonly AlertRuleServiceInterface $rules,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            AlertRuleResource::collection($this->rules->list())->resolve($request),
        );
    }

    public function store(StoreAlertRuleRequest $request): JsonResponse
    {
        return response()->json(
            (new AlertRuleResource($this->rules->create($request->validated())))->resolve($request),
            201,
        );
    }

    public function update(UpdateAlertRuleRequest $request, int $ruleId): JsonResponse
    {
        return response()->json(
            (new AlertRuleResource(
                $this->rules->update($ruleId, $request->validated()),
            ))->resolve($request),
        );
    }

    public function destroy(int $ruleId): JsonResponse
    {
        $this->rules->delete($ruleId);

        return response()->json(null, 204);
    }
}
