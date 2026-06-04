<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('key', 128)->unique()->comment('Notification type key, e.g. document.validation_requested');
            $table->string('source_app', 64)->comment('Emitting service: maya-dms, maya-authorization, maya-logs, dashboard');
            $table->string('category', 20)->comment('event (business-event driven) | scheduled (owner-service cron)');
            $table->string('label', 200)->comment('Human label for the admin panel');
            $table->text('description')->nullable();

            // The toggle — checked at ingestion to drop disabled types.
            $table->boolean('enabled')->default(true);

            // Presentation defaults applied when payload omits them.
            $table->enum('default_severity', ['critical', 'high', 'medium', 'low', 'info'])->default('info');
            $table->string('title_key', 200)->comment('i18n key for the title');
            $table->string('body_key', 200)->comment('i18n key for the body');
            $table->string('url_template', 2048)->nullable()->comment('e.g. /documents/{document_id}');
            $table->string('target_app', 64)->nullable()->comment('Frontend service that hosts the url resource (peerOrigin token): dms, logs, dashboard…');

            // Scheduled-rule metadata (category=scheduled); evaluation runs in the owner service.
            $table->string('schedule_cron', 64)->nullable();
            $table->timestampTz('last_evaluated_at')->nullable();

            // Default audience (value object persisted as JSON).
            $table->jsonb('audience')->nullable();

            $table->timestampsTz();

            $table->index(['source_app', 'category']);
            $table->index('enabled');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_definitions');
    }
};
