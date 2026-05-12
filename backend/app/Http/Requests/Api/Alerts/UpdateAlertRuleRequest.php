<?php

namespace App\Http\Requests\Api\Alerts;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAlertRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'string', 'max:200'],
            'description'      => ['sometimes', 'nullable', 'string'],
            'query_sql'        => ['sometimes', 'string'],
            'severity'         => ['sometimes', 'in:critical,high,medium,low'],
            'schedule_cron'    => ['sometimes', 'string', 'max:64'],
            'enabled'          => ['sometimes', 'boolean'],
            'context_template' => ['sometimes', 'array'],
        ];
    }
}
