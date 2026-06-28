<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Application extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'color', 'traefik_url', 'is_active', 'view_permission_slug'];

    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_favorite_applications');
    }
}
