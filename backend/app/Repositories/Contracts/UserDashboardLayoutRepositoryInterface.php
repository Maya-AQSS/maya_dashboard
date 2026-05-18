<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\User;
use App\Models\UserDashboardLayout;

interface UserDashboardLayoutRepositoryInterface
{
    /**
     * Devuelve el layout persistido o uno transitorio vacío si todavía no existe.
     */
    public function getOrMake(User $user): UserDashboardLayout;

    /**
     * Persiste el layout para el usuario indicado.
     *
     * @param  array<int, mixed>  $layout
     */
    public function upsert(User $user, array $layout): UserDashboardLayout;
}
