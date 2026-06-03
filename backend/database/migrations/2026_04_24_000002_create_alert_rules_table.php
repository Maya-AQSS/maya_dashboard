<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_rules', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 128)->unique();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->text('query_sql')->comment('SELECT that yields >0 rows to trigger');
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->string('schedule_cron', 64)->default('*/5 * * * *');
            $table->boolean('enabled')->default(true);
            $table->jsonb('context_template')->nullable()->comment('Static keys merged into alert context');
            $table->timestampTz('last_evaluated_at')->nullable();
            $table->boolean('notify_all')->default(true);
            $table->string('audience_kind', 20)->nullable()->comment('academic | team');
            $table->string('academic_level', 20)->nullable()->comment('study_type | study | module');
            $table->string('audience_study_type_id', 64)->nullable();
            $table->string('audience_study_id', 64)->nullable();
            $table->string('audience_module_id', 64)->nullable();
            $table->string('audience_team_id', 64)->nullable();
            $table->timestampsTz();
            $table->string('created_by_id', 36)->nullable()->after('updated_at')->comment('Keycloak UUID of the user who created the rule');

            $table->index(['enabled', 'last_evaluated_at']);
        });

        // Partial index: EvaluateAlertRules (runs every 60s) only scans active rules.
        // A boolean B-tree has too low cardinality for PostgreSQL to choose; a partial
        // index on the true side is the correct approach here.
        DB::statement(
            'CREATE INDEX IF NOT EXISTS alert_rules_enabled_idx ON alert_rules (id) WHERE enabled = TRUE'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS alert_rules_enabled_idx');
        Schema::dropIfExists('alert_rules');
    }
};
