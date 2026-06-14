<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Lectura de la vista `bookings` — proyección FDW de `v_app_bookings` en Odoo.
 * Solo lectura.
 */
class Booking extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'bookings';

    protected $fillable = [
        'user_id',
        'title',
        'resource_id',
        'resource_name',
        'start_at',
        'end_at',
        'all_day',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'all_day' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
