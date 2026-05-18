<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\Access\Authorizable;

/**
 * Mapea la vista FDW 'users' → odoo.v_app_users (read-only).
 * PK = keycloak_user_id (UUID Keycloak). Sin timestamps ni password local.
 */
class User extends Model implements \Illuminate\Contracts\Auth\Access\Authorizable, AuthenticatableContract
{
    use Authenticatable, Authorizable, HasFactory;

    public $timestamps = false;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'email',
        'name',
        'first_name',
        'last_name',
        'username',
        'employee_id',
        'dni',
        'employee_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function favoriteApplications(): BelongsToMany
    {
        return $this->belongsToMany(Application::class, 'user_favorite_applications', 'user_id', 'application_id');
    }

    public function dashboardLayout(): HasOne
    {
        return $this->hasOne(UserDashboardLayout::class, 'user_id', 'id');
    }
}
