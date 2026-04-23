<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertRule extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'enabled'           => 'boolean',
            'context_template'  => 'array',
            'last_evaluated_at' => 'datetime',
        ];
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'rule_slug', 'slug');
    }
}
