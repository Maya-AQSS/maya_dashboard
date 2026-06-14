<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\User;
use Generator;

interface UserRepositoryInterface
{
    public function exists(string $keycloakId): bool;

    /**
     * Returns the id of the first active user, or null when none exists.
     */
    public function firstActiveId(): ?string;

    /**
     * Returns active user IDs as a generator.
     *
     * @return Generator<string>
     */
    public function cursorActiveIds(): Generator;

    /**
     * @return Generator<User>
     */
    public function cursorActive(): Generator;
}
