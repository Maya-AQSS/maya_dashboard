<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

trait ValidatesAlertAudience
{
    /**
     * @return array<string, mixed>
     */
    protected function alertAudienceRules(): array
    {
        return [
            'notify_all' => ['boolean'],
            'audience_kind' => ['required_if:notify_all,false', 'nullable', 'string', 'in:academic,team'],
            'academic_level' => ['required_if:audience_kind,academic', 'nullable', 'string', 'in:study_type,study,module'],
            'audience_study_type_id' => ['required_if:audience_kind,academic', 'nullable', 'string', 'max:64'],
            'audience_study_id' => ['required_if:academic_level,study', 'required_if:academic_level,module', 'nullable', 'string', 'max:64'],
            'audience_module_id' => ['required_if:academic_level,module', 'nullable', 'string', 'max:64'],
            'audience_team_id' => ['required_if:audience_kind,team', 'nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function alertAudienceAttributes(): array
    {
        return [
            'notify_all' => 'enviar a todos',
            'audience_kind' => 'tipo de audiencia',
            'academic_level' => 'nivel académico',
            'audience_study_type_id' => 'tipo de estudio',
            'audience_study_id' => 'estudio',
            'audience_module_id' => 'módulo',
            'audience_team_id' => 'equipo',
        ];
    }

    protected function prepareAlertAudienceDefaults(): void
    {
        if (! $this->has('notify_all')) {
            $this->merge(['notify_all' => true]);
        }
    }
}
