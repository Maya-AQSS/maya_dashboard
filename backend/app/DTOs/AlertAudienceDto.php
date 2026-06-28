<?php

declare(strict_types=1);

namespace App\DTOs;

use Illuminate\Database\Eloquent\Model;

/**
 * Configuración de audiencia para notificaciones y alertas de panel.
 *
 * Persistida como JSON en la columna `audience` (ver App\Casts\AsAudience).
 */
final readonly class AlertAudienceDto
{
    public function __construct(
        public bool $notifyAll,
        public ?string $audienceKind,
        public ?string $academicLevel,
        public ?string $audienceStudyTypeId,
        public ?string $audienceStudyId,
        public ?string $audienceModuleId,
        public ?string $audienceTeamId,
    ) {}

    public static function fromModel(Model $model): self
    {
        $audience = $model->getAttribute('audience');

        if ($audience instanceof self) {
            return $audience;
        }

        if (is_array($audience)) {
            return self::fromArray($audience);
        }

        return self::fromArray($model->getAttributes());
    }

    public static function allRecipients(): self
    {
        return new self(true, null, null, null, null, null, null);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            notifyAll: (bool) ($data['notify_all'] ?? true),
            audienceKind: isset($data['audience_kind']) ? (string) $data['audience_kind'] : null,
            academicLevel: isset($data['academic_level']) ? (string) $data['academic_level'] : null,
            audienceStudyTypeId: isset($data['audience_study_type_id']) ? (string) $data['audience_study_type_id'] : null,
            audienceStudyId: isset($data['audience_study_id']) ? (string) $data['audience_study_id'] : null,
            audienceModuleId: isset($data['audience_module_id']) ? (string) $data['audience_module_id'] : null,
            audienceTeamId: isset($data['audience_team_id']) ? (string) $data['audience_team_id'] : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toPersistenceArray(): array
    {
        return [
            'notify_all' => $this->notifyAll,
            'audience_kind' => $this->audienceKind,
            'academic_level' => $this->academicLevel,
            'audience_study_type_id' => $this->audienceStudyTypeId,
            'audience_study_id' => $this->audienceStudyId,
            'audience_module_id' => $this->audienceModuleId,
            'audience_team_id' => $this->audienceTeamId,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return $this->toPersistenceArray();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public static function fromValidatedInput(array $input): self
    {
        $notifyAll = (bool) ($input['notify_all'] ?? true);

        if ($notifyAll) {
            return new self(
                notifyAll: true,
                audienceKind: null,
                academicLevel: null,
                audienceStudyTypeId: null,
                audienceStudyId: null,
                audienceModuleId: null,
                audienceTeamId: null,
            );
        }

        $kind = (string) $input['audience_kind'];

        if ($kind === 'team') {
            return new self(
                notifyAll: false,
                audienceKind: 'team',
                academicLevel: null,
                audienceStudyTypeId: null,
                audienceStudyId: null,
                audienceModuleId: null,
                audienceTeamId: (string) $input['audience_team_id'],
            );
        }

        $level = (string) $input['academic_level'];

        return new self(
            notifyAll: false,
            audienceKind: 'academic',
            academicLevel: $level,
            audienceStudyTypeId: (string) $input['audience_study_type_id'],
            audienceStudyId: match ($level) {
                'study', 'module' => (string) $input['audience_study_id'],
                default => null,
            },
            audienceModuleId: $level === 'module' ? (string) $input['audience_module_id'] : null,
            audienceTeamId: null,
        );
    }
}
