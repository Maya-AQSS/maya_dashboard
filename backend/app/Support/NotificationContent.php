<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\Lang;

/**
 * Resolves a notification's display title/body for a given locale.
 *
 * A notification carries EITHER free text (manual alerts) OR i18n keys
 * (system notifications) + params. Keys win when present; if a key has no
 * translation we fall back to the free text and finally to the raw key.
 */
final class NotificationContent
{
    /**
     * @param  array<string, mixed>  $params
     */
    public static function resolveTitle(?string $titleKey, ?string $title, array $params, ?string $locale = null): string
    {
        return self::resolve($titleKey, $title, $params, $locale);
    }

    /**
     * @param  array<string, mixed>  $params
     */
    public static function resolveBody(?string $bodyKey, ?string $body, array $params, ?string $locale = null): ?string
    {
        if ($bodyKey === null && $body === null) {
            return null;
        }

        return self::resolve($bodyKey, $body, $params, $locale);
    }

    /**
     * Fill a URL template (e.g. /documents/{document_id}) from params.
     *
     * @param  array<string, mixed>  $params
     */
    public static function resolveUrl(?string $urlTemplate, array $params): ?string
    {
        if ($urlTemplate === null || $urlTemplate === '') {
            return null;
        }

        return preg_replace_callback(
            '/\{(\w+)\}/',
            static fn (array $m): string => isset($params[$m[1]]) ? rawurlencode((string) $params[$m[1]]) : $m[0],
            $urlTemplate,
        ) ?? $urlTemplate;
    }

    /**
     * @param  array<string, mixed>  $params
     */
    private static function resolve(?string $key, ?string $fallback, array $params, ?string $locale): string
    {
        if ($key !== null && $key !== '') {
            if (Lang::has($key, $locale)) {
                return (string) Lang::get($key, $params, $locale);
            }

            // No translation found — prefer free text, else the raw key.
            return $fallback !== null && $fallback !== '' ? $fallback : $key;
        }

        return (string) ($fallback ?? '');
    }
}
