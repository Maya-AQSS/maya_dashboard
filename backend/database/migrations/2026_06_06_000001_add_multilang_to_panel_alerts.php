<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Alertas de panel multilingües.
 *
 * - Añade `default_locale` a `panel_alerts` (idioma del texto base).
 * - Conserva `text`/`action_label` como espejo del idioma por defecto
 *   (fallback de lectura, canal email y búsqueda/listado).
 * - Backfilla las traducciones existentes a la tabla polimórfica `translations`
 *   bajo el `default_locale`, para que el contenido actual quede disponible vía
 *   el nuevo mecanismo multiidioma sin pérdida.
 *
 * Depende de la tabla `translations` (paquete shared-translations-laravel),
 * cuya migración corre antes por timestamp (2026_06_05).
 */
return new class extends Migration
{
    private const DEFAULT_LOCALE = 'es';

    public function up(): void
    {
        Schema::table('panel_alerts', function (Blueprint $table) {
            $table->string('default_locale', 12)->default(self::DEFAULT_LOCALE)->after('text');
        });

        // Backfill: cada alerta existente vuelca su text/action_label a
        // `translations` bajo el locale por defecto.
        if (! Schema::hasTable('translations')) {
            return;
        }

        $now = now();
        DB::table('panel_alerts')->orderBy('id')->chunkById(200, function ($alerts) use ($now): void {
            $rows = [];
            foreach ($alerts as $alert) {
                $rows[] = [
                    'translatable_type' => 'panel_alert',
                    'translatable_id' => (string) $alert->id,
                    'field' => 'text',
                    'locale' => self::DEFAULT_LOCALE,
                    'value' => (string) $alert->text,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (isset($alert->action_label) && $alert->action_label !== null && $alert->action_label !== '') {
                    $rows[] = [
                        'translatable_type' => 'panel_alert',
                        'translatable_id' => (string) $alert->id,
                        'field' => 'action_label',
                        'locale' => self::DEFAULT_LOCALE,
                        'value' => (string) $alert->action_label,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if ($rows !== []) {
                DB::table('translations')->insertOrIgnore($rows);
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('translations')) {
            DB::table('translations')
                ->where('translatable_type', 'panel_alert')
                ->delete();
        }

        Schema::table('panel_alerts', function (Blueprint $table) {
            $table->dropColumn('default_locale');
        });
    }
};
