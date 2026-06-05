<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\DTOs\AlertAudienceDto;
use App\DTOs\PanelAlertDto;
use App\Models\PanelAlert;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\PanelAlertServiceInterface;
use Illuminate\Support\Carbon;
use Maya\Http\Pagination\PaginatedDto;

final class PanelAlertService implements PanelAlertServiceInterface
{
    public function __construct(
        private readonly PanelAlertRepositoryInterface $alerts,
        private readonly AlertAudienceServiceInterface $audience,
    ) {}

    /**
     * @return PaginatedDto<PanelAlertDto>
     */
    public function paginate(
        int $perPage,
        ?string $severity,
        ?string $search,
        bool $includeExpired,
        string $sortBy,
        string $sortDir,
    ): PaginatedDto {
        $paginator = $this->alerts->paginate($perPage, $severity, $search, $includeExpired, $sortBy, $sortDir);

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (PanelAlert $alert): PanelAlertDto => PanelAlertDto::fromModel($alert),
        );
    }

    /**
     * @return list<PanelAlertDto>
     */
    public function activeForWidget(int $limit, string $userId): array
    {
        return $this->alerts->activeNow($limit, $userId)
            ->map(fn (PanelAlert $alert): PanelAlertDto => PanelAlertDto::fromModel($alert))
            ->values()
            ->all();
    }

    public function find(int $id): PanelAlertDto
    {
        return PanelAlertDto::fromModel($this->alerts->findOrFail($id));
    }

    public function create(array $data, string $createdBy): PanelAlertDto
    {
        [$data, $textMap, $labelMap] = $this->extractTranslations($data);

        $attributes = $this->audience->attributesForPersist($createdBy, $data);
        $attributes = $this->applyVisibilityWindow($attributes);

        $alert = $this->alerts->create(array_merge($attributes, ['created_by' => $createdBy]));
        $this->syncAlertTranslations($alert, $textMap, $labelMap);

        return PanelAlertDto::fromModel($alert->fresh(['translations']));
    }

    public function update(int $id, array $data, string $updatedBy): PanelAlertDto
    {
        $alert = $this->alerts->findOrFail($id);

        [$data, $textMap, $labelMap] = $this->extractTranslations($data, $alert);

        $attributes = $this->audience->attributesForUpdate(
            $updatedBy,
            $data,
            AlertAudienceDto::fromModel($alert),
        );
        $attributes = $this->applyVisibilityWindow($attributes, $alert);

        $alert = $this->alerts->update($alert, $attributes);
        $this->syncAlertTranslations($alert, $textMap, $labelMap);

        return PanelAlertDto::fromModel($alert->fresh(['translations']));
    }

    /**
     * Normaliza la entrada multiidioma. Acepta dos formas:
     *   - Nueva: `translations` = { text: {locale: value}, action_label: {locale: value} }
     *     + `default_locale`.
     *   - Legacy: `text` (string) [+ `action_label`] en un solo idioma → se trata
     *     como traducción del locale por defecto.
     *
     * Deriva el espejo escalar `text`/`action_label`/`default_locale` (que la
     * pipeline de audiencia y las columnas conservan) y devuelve los mapas por
     * campo. Un mapa null indica "no provisto" (no tocar en update).
     *
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: array<string,string>|null, 2: array<string,string>|null}
     */
    private function extractTranslations(array $data, ?PanelAlert $current = null): array
    {
        $default = is_string($data['default_locale'] ?? null) && $data['default_locale'] !== ''
            ? $data['default_locale']
            : ($current->default_locale ?? 'es');

        $textMap = null;
        $labelMap = null;

        if (isset($data['translations']) && is_array($data['translations'])) {
            $t = $data['translations'];
            $textMap = isset($t['text']) && is_array($t['text']) ? $this->cleanMap($t['text']) : null;
            $labelMap = isset($t['action_label']) && is_array($t['action_label']) ? $this->cleanMap($t['action_label']) : null;
        } else {
            // Legacy: texto plano = traducción del idioma por defecto.
            if (array_key_exists('text', $data) && is_string($data['text'])) {
                $textMap = [$default => $data['text']];
            }
            if (array_key_exists('action_label', $data) && is_string($data['action_label']) && $data['action_label'] !== '') {
                $labelMap = [$default => $data['action_label']];
            }
        }

        unset($data['translations']);
        $data['default_locale'] = $default;

        // Espejo escalar del idioma por defecto (fallback de lectura / email).
        if ($textMap !== null) {
            $data['text'] = $textMap[$default] ?? (reset($textMap) ?: '');
        }
        if ($labelMap !== null) {
            $data['action_label'] = $labelMap[$default] ?? null;
        }

        return [$data, $textMap, $labelMap];
    }

    /**
     * @param  array<array-key, mixed>  $map
     * @return array<string, string>
     */
    private function cleanMap(array $map): array
    {
        $out = [];
        foreach ($map as $locale => $value) {
            if (is_string($value) && trim($value) !== '') {
                $out[(string) $locale] = $value;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, string>|null  $textMap
     * @param  array<string, string>|null  $labelMap
     */
    private function syncAlertTranslations(PanelAlert $alert, ?array $textMap, ?array $labelMap): void
    {
        if ($textMap !== null) {
            $alert->syncTranslations('text', $textMap);
        }
        if ($labelMap !== null) {
            $alert->syncTranslations('action_label', $labelMap);
        }
    }

    /**
     * Fix B2: derive visible_until from duration_minutes when an explicit
     * visible_until is not provided. Works on both create and update (the
     * latter resolving visible_from from the existing row when unchanged).
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function applyVisibilityWindow(array $attributes, ?PanelAlert $current = null): array
    {
        $duration = $attributes['duration_minutes'] ?? $current?->duration_minutes;

        // Explicit visible_until wins; only auto-compute when absent.
        $hasExplicitUntil = array_key_exists('visible_until', $attributes)
            && $attributes['visible_until'] !== null;

        if ($duration === null || $hasExplicitUntil) {
            return $attributes;
        }

        $from = $attributes['visible_from'] ?? $current?->visible_from;
        if ($from === null) {
            return $attributes;
        }

        $attributes['visible_until'] = Carbon::parse($from)->addMinutes((int) $duration);

        return $attributes;
    }

    public function delete(int $id): void
    {
        $this->alerts->delete($this->alerts->findOrFail($id));
    }
}
