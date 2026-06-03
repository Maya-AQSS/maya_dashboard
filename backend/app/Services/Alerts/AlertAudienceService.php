<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\AlertAudienceDto;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\AlertAudienceValidatorInterface;

final class AlertAudienceService implements AlertAudienceServiceInterface
{
    /** @var list<string> */
    public const INPUT_KEYS = [
        'notify_all',
        'audience_kind',
        'academic_level',
        'audience_study_type_id',
        'audience_study_id',
        'audience_module_id',
        'audience_team_id',
    ];

    public function __construct(
        private readonly AlertAudienceValidatorInterface $validator,
    ) {}

    public function attributesForPersist(string $creatorId, array $validated): array
    {
        $this->validator->assertCreatorOwnsAudience($creatorId, $validated);

        $content = array_diff_key($validated, array_flip(self::INPUT_KEYS));
        $audience = AlertAudienceDto::fromValidatedInput($validated)->toPersistenceArray();

        return array_merge($content, $audience);
    }

    public function attributesForUpdate(string $creatorId, array $validated, AlertAudienceDto $current): array
    {
        if (! $this->containsAudienceInput($validated)) {
            return array_diff_key($validated, array_flip(self::INPUT_KEYS));
        }

        return $this->attributesForPersist($creatorId, array_merge($current->toApiArray(), $validated));
    }

    public function containsAudienceInput(array $data): bool
    {
        foreach (self::INPUT_KEYS as $key) {
            if (array_key_exists($key, $data)) {
                return true;
            }
        }

        return false;
    }
}
