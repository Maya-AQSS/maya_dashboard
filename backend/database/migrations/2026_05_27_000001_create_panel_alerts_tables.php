<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('panel_alert_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('event_type', 255)->comment("e.g. 'manual', 'user.login', 'fichaje.missing', custom string");
            $table->jsonb('conditions')->nullable()->comment('Array of {key, operator, value} condition objects');
            $table->text('alert_text')->comment('Template, may contain {{variable}} placeholders');
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->string('action_label', 255)->nullable();
            $table->string('action_url', 2048)->nullable();
            $table->unsignedInteger('visible_duration_hours')->nullable()->comment('NULL means no automatic expiry');
            $table->unsignedInteger('max_frequency_minutes')->nullable()->default(60)->comment('Min interval between auto-triggers');
            $table->boolean('is_active')->default(true);
            $table->timestampTz('last_triggered_at')->nullable();
            $table->string('created_by', 255)->comment('Keycloak UUID');
            $table->boolean('notify_all')->default(true);
            $table->string('audience_kind', 20)->nullable()->comment('academic | team');
            $table->string('academic_level', 20)->nullable()->comment('study_type | study | module');
            $table->string('audience_study_type_id', 64)->nullable();
            $table->string('audience_study_id', 64)->nullable();
            $table->string('audience_module_id', 64)->nullable();
            $table->string('audience_team_id', 64)->nullable();
            $table->timestampsTz();
        });

        Schema::create('panel_alerts', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->string('action_label', 255)->nullable();
            $table->string('action_url', 2048)->nullable();
            $table->timestampTz('visible_from');
            $table->timestampTz('visible_until')->nullable();
            $table->string('source', 20)->default('manual')->comment("'manual' | 'rule'");
            $table->foreignId('rule_id')
                ->nullable()
                ->constrained('panel_alert_rules')
                ->nullOnDelete();
            $table->string('created_by', 255)->comment('Keycloak UUID');
            $table->boolean('notify_all')->default(true);
            $table->string('audience_kind', 20)->nullable()->comment('academic | team');
            $table->string('academic_level', 20)->nullable()->comment('study_type | study | module');
            $table->string('audience_study_type_id', 64)->nullable();
            $table->string('audience_study_id', 64)->nullable();
            $table->string('audience_module_id', 64)->nullable();
            $table->string('audience_team_id', 64)->nullable();
            $table->timestampsTz();

            $table->index(['visible_from', 'visible_until']);
            $table->index('severity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panel_alerts');
        Schema::dropIfExists('panel_alert_rules');
    }
};
