<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique()->comment('AMQP message_id — idempotency key');
            $table->string('rule_slug', 128)->nullable()->comment('NULL allowed for ad-hoc alerts');
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->string('title', 200);
            $table->string('source', 64)->comment('logs.aggregation | metric.threshold | app.publish | manual | system.dlq');
            $table->jsonb('context');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('acknowledged_at')->nullable();
            $table->string('acknowledged_by', 255)->nullable()->comment('FDW users.id (Keycloak UUID)');
            $table->timestampTz('resolved_at')->nullable();
            $table->string('resolved_by', 255)->nullable()->comment('FDW users.id (Keycloak UUID)');

            $table->foreign('rule_slug')->references('slug')->on('alert_rules')->nullOnDelete();
            $table->index(['severity', 'acknowledged_at']);
            $table->index(['rule_slug', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
