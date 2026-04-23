<?php

namespace App\Http\Controllers\Api\V1\Alerts;

use App\Http\Controllers\Controller;
use App\Models\AlertRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertRuleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AlertRule::orderBy('slug')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug'             => ['required', 'string', 'max:128', 'unique:alert_rules,slug', 'regex:/^[a-z0-9][a-z0-9\-]*$/'],
            'name'             => ['required', 'string', 'max:200'],
            'description'      => ['nullable', 'string'],
            'query_sql'        => ['required', 'string'],
            'severity'         => ['required', 'in:critical,high,medium,low'],
            'schedule_cron'    => ['string', 'max:64'],
            'enabled'          => ['boolean'],
            'context_template' => ['array'],
        ]);

        $rule = AlertRule::create($data);
        return response()->json($rule, 201);
    }

    public function update(Request $request, int $ruleId): JsonResponse
    {
        $rule = AlertRule::findOrFail($ruleId);
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:200'],
            'description'      => ['sometimes', 'nullable', 'string'],
            'query_sql'        => ['sometimes', 'string'],
            'severity'         => ['sometimes', 'in:critical,high,medium,low'],
            'schedule_cron'    => ['sometimes', 'string', 'max:64'],
            'enabled'          => ['sometimes', 'boolean'],
            'context_template' => ['sometimes', 'array'],
        ]);
        $rule->update($data);
        return response()->json($rule);
    }

    public function destroy(int $ruleId): JsonResponse
    {
        AlertRule::findOrFail($ruleId)->delete();
        return response()->json(null, 204);
    }
}
