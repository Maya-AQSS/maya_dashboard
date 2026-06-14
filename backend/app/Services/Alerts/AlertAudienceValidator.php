<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\Services\Contracts\AlertAudienceValidatorInterface;
use Illuminate\Validation\ValidationException;
use Maya\Profile\Dtos\AcademicContextDto;
use Maya\Profile\Dtos\CourseModuleDto;
use Maya\Profile\Dtos\StudyDto;
use Maya\Profile\Services\Contracts\AcademicContextServiceInterface;

final class AlertAudienceValidator implements AlertAudienceValidatorInterface
{
    public function __construct(
        private readonly AcademicContextServiceInterface $academicContext,
    ) {}

    public function assertCreatorOwnsAudience(string $creatorId, array $audienceInput): void
    {
        if ((bool) ($audienceInput['notify_all'] ?? true)) {
            return;
        }

        $context = $this->academicContext->forUser($creatorId);
        $kind = (string) $audienceInput['audience_kind'];

        if ($kind === 'team') {
            $this->assertTeamOwned($context, (string) $audienceInput['audience_team_id']);

            return;
        }

        $this->assertAcademicOwned($context, $audienceInput);
    }

    private function assertTeamOwned(AcademicContextDto $context, string $teamId): void
    {
        if ($context->status['teams'] !== 'ok') {
            throw ValidationException::withMessages([
                'audience_team_id' => [__('validation.alert_audience.team_context_unavailable')],
            ]);
        }

        foreach ($context->teams as $team) {
            if ($team->id === $teamId) {
                return;
            }
        }

        throw ValidationException::withMessages([
            'audience_team_id' => [__('validation.alert_audience.team_not_owned')],
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function assertAcademicOwned(AcademicContextDto $context, array $input): void
    {
        $level = (string) $input['academic_level'];
        $studyTypeId = (string) $input['audience_study_type_id'];

        $this->assertStudyTypeOwned($context, $studyTypeId);

        if ($level === 'study_type') {
            return;
        }

        $studyId = (string) $input['audience_study_id'];
        $study = $this->findStudy($context, $studyId);

        if ($study === null || $study->studyTypeId !== $studyTypeId) {
            throw ValidationException::withMessages([
                'audience_study_id' => [__('validation.alert_audience.study_not_in_type')],
            ]);
        }

        if ($level === 'study') {
            return;
        }

        $moduleId = (string) $input['audience_module_id'];
        $module = $this->findModule($context, $moduleId);

        if ($module === null || $module->studyId !== $studyId) {
            throw ValidationException::withMessages([
                'audience_module_id' => [__('validation.alert_audience.module_not_in_study')],
            ]);
        }
    }

    private function assertStudyTypeOwned(AcademicContextDto $context, string $studyTypeId): void
    {
        if ($context->status['study_types'] !== 'ok') {
            throw ValidationException::withMessages([
                'audience_study_type_id' => [__('validation.alert_audience.academic_context_unavailable')],
            ]);
        }

        foreach ($context->studyTypes as $item) {
            if ($item->id === $studyTypeId) {
                return;
            }
        }

        throw ValidationException::withMessages([
            'audience_study_type_id' => [__('validation.alert_audience.study_type_not_owned')],
        ]);
    }

    private function findStudy(AcademicContextDto $context, string $studyId): ?StudyDto
    {
        if ($context->status['studies'] !== 'ok') {
            throw ValidationException::withMessages([
                'audience_study_id' => [__('validation.alert_audience.study_context_unavailable')],
            ]);
        }

        foreach ($context->studies as $study) {
            if ($study->id === $studyId) {
                return $study;
            }
        }

        return null;
    }

    private function findModule(AcademicContextDto $context, string $moduleId): ?CourseModuleDto
    {
        if ($context->status['modules'] !== 'ok') {
            throw ValidationException::withMessages([
                'audience_module_id' => [__('validation.alert_audience.module_context_unavailable')],
            ]);
        }

        foreach ($context->modules as $module) {
            if ($module->id === $moduleId) {
                return $module;
            }
        }

        return null;
    }
}
