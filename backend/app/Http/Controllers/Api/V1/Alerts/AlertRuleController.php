<?php

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Alerts\StoreAlertRuleRequest;
use App\Http\Requests\Api\Alerts\UpdateAlertRuleRequest;
use App\Services\Contracts\AlertRuleServiceInterface;
use Illuminate\Http\JsonResponse;

class AlertRuleController extends Controller
{
    public function __construct(
        private readonly AlertRuleServiceInterface $rules,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->rules->list());
    }

    public function store(StoreAlertRuleRequest $request): JsonResponse
    {
        return response()->json(
            $this->rules->create($request->validated()),
            201,
        );
    }

    public function update(UpdateAlertRuleRequest $request, int $ruleId): JsonResponse
    {
        return response()->json(
            $this->rules->update($ruleId, $request->validated()),
        );
    }

    public function destroy(int $ruleId): JsonResponse
    {
        $this->rules->delete($ruleId);

        return response()->json(null, 204);
    }
}
