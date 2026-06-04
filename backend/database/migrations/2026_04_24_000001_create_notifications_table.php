<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique()->comment('AMQP message_id — idempotency key');
            $table->string('app', 64);
            $table->string('type', 128)->comment('Definition key, dot-separated, e.g. document.validation_requested');

            // Recipient: nullable for scope=dashboard (shared) notifications.
            $table->string('recipient_id', 255)->nullable()->comment('FDW users.id (Keycloak UUID); NULL for dashboard scope');

            // Content — either free text (manual alerts) or i18n keys (system notifications).
            $table->string('title', 200)->nullable()->comment('Free text title (manual alerts)');
            $table->text('body')->nullable()->comment('Free text body (manual alerts)');
            $table->string('title_key', 200)->nullable()->comment('i18n key resolved per recipient locale');
            $table->string('body_key', 200)->nullable()->comment('i18n key resolved per recipient locale');
            $table->jsonb('params')->nullable()->comment('Interpolation params for i18n keys');

            // Presentation.
            $table->enum('severity', ['critical', 'high', 'medium', 'low', 'info'])->default('info');
            $table->string('url', 2048)->nullable()->comment('Resolved click-through URL (relative to target_app frontend)');
            $table->string('target_app', 64)->nullable()->comment('Frontend service that hosts the url resource (peerOrigin token)');
            $table->string('scope', 20)->default('user')->comment('Distribution scope: user | dashboard | both');

            $table->jsonb('channels')->comment('Array of app|email|webhook|slack');
            $table->jsonb('metadata')->nullable();

            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('read_at')->nullable();

            // Cross-domain alert lifecycle.
            $table->timestampTz('acknowledged_at')->nullable();
            $table->uuid('acknowledged_by')->nullable()->comment('Keycloak ID of user who acknowledged');
            $table->timestampTz('resolved_at')->nullable();
            $table->uuid('resolved_by')->nullable()->comment('Keycloak ID of user who resolved');

            $table->index(['recipient_id', 'read_at']);
            $table->index(['app', 'type']);
            $table->index('created_at');
            $table->index('severity');
            $table->index('scope');
            $table->index(['scope', 'severity']);
        });

        // Partial index: most inbox queries filter by a concrete recipient.
        DB::statement('CREATE INDEX notifications_recipient_present_idx ON notifications (recipient_id) WHERE recipient_id IS NOT NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
