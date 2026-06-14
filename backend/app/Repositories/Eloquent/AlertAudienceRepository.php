<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\AlertAudienceDto;
use App\Models\User;
use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use Generator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final class AlertAudienceRepository implements AlertAudienceRepositoryInterface
{
    public function cursorRecipientIdsForAudience(AlertAudienceDto $audience): Generator
    {
        if ($audience->notifyAll) {
            foreach (User::query()->where('is_active', true)->select('id')->cursor() as $user) {
                yield (string) $user->id;
            }

            return;
        }

        $query = User::query()
            ->where('is_active', true)
            ->select('users.id');

        $this->applyAudienceConstraint($query, $audience);

        foreach ($query->cursor() as $user) {
            yield (string) $user->id;
        }
    }

    public function userMatchesAudience(string $userId, AlertAudienceDto $audience): bool
    {
        if ($audience->notifyAll) {
            return true;
        }

        $query = User::query()
            ->where('is_active', true)
            ->where('id', $userId);

        $this->applyAudienceConstraint($query, $audience);

        return $query->exists();
    }

    /**
     * @param  Builder<User>  $query
     */
    private function applyAudienceConstraint($query, AlertAudienceDto $audience): void
    {
        if ($audience->audienceKind === 'team' && $audience->audienceTeamId !== null) {
            $query->whereExists(function ($sub) use ($audience): void {
                $sub->select(DB::raw('1'))
                    ->from('team_members')
                    ->whereColumn('team_members.user_id', 'users.id')
                    ->where('team_members.team_id', $audience->audienceTeamId);
            });

            return;
        }

        if ($audience->audienceKind !== 'academic') {
            $query->whereRaw('1 = 0');

            return;
        }

        match ($audience->academicLevel) {
            'study_type' => $query->whereExists(function ($sub) use ($audience): void {
                $sub->select(DB::raw('1'))
                    ->from('user_study_types')
                    ->whereColumn('user_study_types.user_id', 'users.id')
                    ->where('user_study_types.study_type_id', $audience->audienceStudyTypeId);
            }),
            'study' => $query->whereExists(function ($sub) use ($audience): void {
                $sub->select(DB::raw('1'))
                    ->from('user_studies')
                    ->whereColumn('user_studies.user_id', 'users.id')
                    ->where('user_studies.study_id', $audience->audienceStudyId);
            }),
            'module' => $query->whereExists(function ($sub) use ($audience): void {
                $sub->select(DB::raw('1'))
                    ->from('user_course_modules')
                    ->whereColumn('user_course_modules.user_id', 'users.id')
                    ->where('user_course_modules.module_id', $audience->audienceModuleId);
            }),
            default => $query->whereRaw('1 = 0'),
        };
    }
}
