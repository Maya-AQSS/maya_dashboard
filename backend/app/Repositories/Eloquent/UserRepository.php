<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Generator;

final class UserRepository implements UserRepositoryInterface
{
    public function exists(string $keycloakId): bool
    {
        return User::query()->where('id', $keycloakId)->exists();
    }

    /**
     * @return Generator<User>
     */
    public function cursorActive(): Generator
    {
        yield from User::query()
            ->where('is_active', true)
            ->select('id')
            ->cursor();
    }
}
