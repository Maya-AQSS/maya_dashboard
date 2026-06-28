<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsAudience;
use App\Eloquent\Relations\StringKeyMorphMany;
use App\Observers\PanelAlertObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Maya\Translations\Concerns\HasTranslations;
use Maya\Translations\Models\Translation;

#[ObservedBy([PanelAlertObserver::class])]
class PanelAlert extends Model
{
    use HasFactory;
    use HasTranslations;

    /** Campos traducibles vía la tabla polimórfica `translations`. */
    protected array $translatable = ['text', 'action_label'];

    protected $fillable = [
        'text',
        'default_locale',
        'severity',
        'action_label',
        'action_url',
        'visible_from',
        'visible_until',
        'schedule_cron',
        'duration_minutes',
        'last_materialized_at',
        'source',
        'created_by',
        'audience',
    ];

    protected function casts(): array
    {
        return [
            'visible_from' => 'datetime',
            'visible_until' => 'datetime',
            'last_materialized_at' => 'datetime',
            'duration_minutes' => 'integer',
            'audience' => AsAudience::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Scope to alerts currently visible: visible_from <= now AND (visible_until IS NULL OR visible_until >= now).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('visible_from', '<=', now())
            ->where(function (Builder $q) {
                $q->whereNull('visible_until')
                    ->orWhere('visible_until', '>=', now());
            });
    }

    /**
     * Recurring alerts have a cron expression that drives re-materialization.
     */
    public function scopeRecurring(Builder $query): Builder
    {
        return $query->whereNotNull('schedule_cron');
    }

    public function isRecurring(): bool
    {
        return $this->schedule_cron !== null;
    }

    /**
     * La FK polimórfica `translations.translatable_id` es VARCHAR pero la PK de
     * este modelo es bigint. Inyectamos StringKeyMorphMany para que la
     * comparación se bindee como string (Postgres es estricto: `varchar = int`
     * no tiene operador). Acotado a la relación con Translation.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<*>  $query
     */
    protected function newMorphMany(Builder $query, Model $parent, $type, $id, $localKey)
    {
        if ($query->getModel() instanceof Translation) {
            return new StringKeyMorphMany($query, $parent, $type, $id, $localKey);
        }

        return parent::newMorphMany($query, $parent, $type, $id, $localKey);
    }
}
