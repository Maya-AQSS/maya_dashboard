<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds structured condition engine support to notification_rules.
 *
 * The `conditions` JSONB field allows admins to define arbitrary field-level
 * comparisons against any FDW table available in the owning service, without
 * writing a custom PHP evaluator per rule type. The v_notification_rules view
 * is recreated to expose the new column to FDW consumers (stable cross-DB
 * contract — only append, never reorder columns).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_rules', function (Blueprint $table) {
            $table->jsonb('conditions')->nullable()
                ->after('params')
                ->comment('Optional condition engine payload: {logic: AND|OR, items: [{table, field, op, value}]}');
        });

        // Postgres no permite insertar columnas en medio con CREATE OR REPLACE VIEW.
        DB::statement('DROP VIEW IF EXISTS v_notification_rules');

        DB::statement(<<<'SQL'
            CREATE VIEW v_notification_rules AS
            SELECT
                r.id,
                r.evaluator_key,
                r.source_app,
                r.params,
                r.conditions,
                r.schedule_cron,
                r.audience,
                COALESCE(r.severity, d.default_severity, 'info') AS severity
            FROM notification_rules r
            JOIN notification_definitions d ON d.key = r.evaluator_key
            WHERE r.enabled = TRUE
              AND d.enabled = TRUE
        SQL);

        DB::statement('GRANT SELECT ON v_notification_rules TO PUBLIC');
    }

    public function down(): void
    {
        // Restore the view without `conditions` before dropping the column.
        DB::statement('DROP VIEW IF EXISTS v_notification_rules');

        DB::statement(<<<'SQL'
            CREATE VIEW v_notification_rules AS
            SELECT
                r.id,
                r.evaluator_key,
                r.source_app,
                r.params,
                r.schedule_cron,
                r.audience,
                COALESCE(r.severity, d.default_severity, 'info') AS severity
            FROM notification_rules r
            JOIN notification_definitions d ON d.key = r.evaluator_key
            WHERE r.enabled = TRUE
              AND d.enabled = TRUE
        SQL);

        DB::statement('GRANT SELECT ON v_notification_rules TO PUBLIC');

        Schema::table('notification_rules', function (Blueprint $table) {
            $table->dropColumn('conditions');
        });
    }
};
