<?php
declare(strict_types=1);

namespace App\Models;

use App\Observers\UserFavoriteApplicationObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([UserFavoriteApplicationObserver::class])]
class UserFavoriteApplication extends Model
{
    protected $fillable = ['user_id', 'application_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
