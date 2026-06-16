<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

/**
 * Shared validation rules for the `conditions` payload in notification rules.
 *
 * Condition shape:
 *   { "logic": "AND"|"OR", "items": [{ "table", "field", "op", "value" }] }
 *
 * - `table` and `field` are validated server-side; the GenericConditionEvaluator
 *   in each owning service enforces a whitelist on execution.
 * - `value` is absent for is_null/is_not_null, an array for in/not_in,
 *   a non-negative integer for older_than_days/within_days, or a scalar otherwise.
 */
trait ValidatesNotificationConditions
{
    public const CONDITION_OPERATORS = [
        'eq', 'ne', 'gt', 'lt', 'gte', 'lte',
        'contains', 'starts_with', 'ends_with',
        'in', 'not_in',
        'is_null', 'is_not_null',
        'older_than_days', 'within_days',
    ];

    /** @return array<string, mixed> */
    protected function conditionsRules(): array
    {
        return [
            'conditions'              => ['nullable', 'array'],
            'conditions.logic'        => ['required_with:conditions', 'string', Rule::in(['AND', 'OR'])],
            'conditions.items'        => ['required_with:conditions', 'array', 'min:1'],
            'conditions.items.*.table' => ['required', 'string', 'max:64', 'regex:/^[a-z_][a-z0-9_]*$/'],
            'conditions.items.*.field' => ['required', 'string', 'max:64', 'regex:/^[a-z_][a-z0-9_]*$/'],
            'conditions.items.*.op'   => ['required', 'string', Rule::in(self::CONDITION_OPERATORS)],
            'conditions.items.*.value' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $index = (int) explode('.', $attribute)[2];
                    $op = $this->input("conditions.items.{$index}.op");

                    if (in_array($op, ['is_null', 'is_not_null'], true)) {
                        // value must be absent or null
                        return;
                    }

                    if ($value === null) {
                        $fail(__('validation.required', ['attribute' => $attribute]));
                        return;
                    }

                    if (in_array($op, ['in', 'not_in'], true) && ! is_array($value)) {
                        $fail(__('validation.array', ['attribute' => $attribute]));
                        return;
                    }

                    if (in_array($op, ['older_than_days', 'within_days'], true)) {
                        if (! is_int($value) || $value < 0) {
                            $fail(__('validation.notification_rule.condition_days_value'));
                        }
                    }
                },
            ],
        ];
    }
}
