<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Contracts\Validation\Validator;

/**
 * Reglas de validación del contenido multiidioma de una alerta de panel.
 *
 * Formato de entrada:
 *   {
 *     "default_locale": "es",
 *     "translations": {
 *       "text":         { "es": "...", "va": "...", "en": "..." },
 *       "action_label": { "es": "...", "va": "..." }
 *     }
 *   }
 *
 * Solo el idioma por defecto es obligatorio (decisión de producto); el resto
 * son opcionales y caen al por defecto en lectura. Se mantiene compatibilidad
 * con el formato legacy (`text` string suelto) vía `required_without`.
 */
trait ValidatesPanelAlertTranslations
{
    /**
     * @return array<string, mixed>
     */
    protected function translationRules(bool $creating): array
    {
        return [
            'default_locale' => ['sometimes', 'nullable', 'string', 'max:12'],
            'translations' => ['sometimes', 'array'],
            'translations.text' => [$creating ? 'required_without:text' : 'sometimes', 'array'],
            'translations.text.*' => ['nullable', 'string'],
            'translations.action_label' => ['sometimes', 'nullable', 'array'],
            'translations.action_label.*' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Exige que el idioma por defecto tenga texto no vacío cuando se usa el
     * formato `translations`.
     */
    protected function assertDefaultLocaleTextPresent(Validator $validator): void
    {
        $data = $this->all();
        $textMap = $data['translations']['text'] ?? null;

        if (! is_array($textMap)) {
            return; // formato legacy o campo ausente: lo cubren las reglas base
        }

        $default = is_string($data['default_locale'] ?? null) && $data['default_locale'] !== ''
            ? $data['default_locale']
            : 'es';

        $value = $textMap[$default] ?? null;
        if (! is_string($value) || trim($value) === '') {
            $validator->errors()->add(
                "translations.text.$default",
                'El texto en el idioma por defecto es obligatorio.',
            );
        }
    }
}
