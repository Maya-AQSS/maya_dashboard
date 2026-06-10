<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('panel_alerts', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->string('default_locale', 12)->default('es');
            $table->enum('severity', ['critical', 'high', 'medium', 'low', 'info']);
            $table->string('action_label', 255)->nullable();
            $table->string('action_url', 2048)->nullable();

            // Visibility window (one occurrence). For recurring alerts the
            // materializer shifts this window on each cron tick.
            $table->timestampTz('visible_from');
            $table->timestampTz('visible_until')->nullable();

            // Recurrence (optional). When schedule_cron is set, panel-alerts:materialize
            // recomputes the window each time the cron is due.
            $table->string('schedule_cron', 64)->nullable()->comment('Cron expression for recurring visibility');
            $table->unsignedInteger('duration_minutes')->nullable()->comment('Window length applied on each (re)materialization');
            $table->timestampTz('last_materialized_at')->nullable();

            $table->string('source', 20)->default('manual')->comment("'manual' | 'scheduled'");
            $table->string('created_by', 255)->comment('Keycloak UUID');

            // Audience targeting (value object persisted as JSON).
            $table->jsonb('audience')->nullable();

            $table->timestampsTz();

            $table->index(['visible_from', 'visible_until']);
            $table->index('severity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panel_alerts');
    }
};
