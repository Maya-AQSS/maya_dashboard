<?php

declare(strict_types=1);

namespace App\Services\Contracts;

interface AlertAudienceValidatorInterface
{
    /**
     * @param  array<string, mixed>  $audienceInput  Campos de audiencia ya validados por FormRequest
     */
    public function assertCreatorOwnsAudience(string $creatorId, array $audienceInput): void;
}
