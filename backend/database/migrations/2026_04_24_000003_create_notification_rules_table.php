<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Configurable instances of scheduled notification rules (level B).
 *
 * A rule references a scheduled notification_definition (by `evaluator_key`)
 * and carries the admin-tunable bits: params (thresholds/windows), cron,
 * audience and severity override. The owning service reads its active rules
 * through the `v_notification_rules` view via postgres_fdw and runs the
 * matching evaluator. The view is the stable cross-DB contract.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_rules', function (Blueprint $table) {
            $table->id();
            $table->string('evaluator_key', 128)->comment('= notification_definitions.key (category=scheduled)');
            $table->string('source_app', 64)->comment('Service that evaluates this rule, e.g. maya-dms');
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->jsonb('params')->default('{}')->comment('Evaluator params: thresholds, windows, etc.');
            $table->string('schedule_cron', 64);
            $table->jsonb('audience')->nullable();
            $table->enum('severity', ['critical', 'high', 'medium', 'low', 'info'])->nullable()->comment('Overrides the definition default when set');
            $table->boolean('enabled')->default(true);
            $table->string('created_by', 255)->nullable();
            $table->timestampsTz();

            $table->index(['source_app', 'enabled']);
            $table->index('evaluator_key');
        });

        // Cross-DB contract for the owning services (postgres_fdw). Only exposes
        // rules that are enabled AND whose definition type is enabled, so the
        // toggle of a type disables all its rules. Severity falls back to the
        // definition default. Never expose the raw table to consumers.
        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_notification_rules AS
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

        // Allow cross-database FDW consumers (same Postgres cluster) to read the
        // contract view. Roles are cluster-wide; least-privilege grant on the
        // view only (not the base table).
        DB::statement('GRANT SELECT ON v_notification_rules TO PUBLIC');
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_notification_rules');
        Schema::dropIfExists('notification_rules');
    }
};
