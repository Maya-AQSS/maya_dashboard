<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique()->comment('AMQP message_id — idempotency key');
            $table->string('app', 64);
            $table->string('type', 128)->comment('Dot-separated, e.g. user.invited');
            $table->string('recipient_id', 255)->comment('FDW users.id (Keycloak UUID)');
            $table->string('title', 200);
            $table->text('body');
            $table->jsonb('channels')->comment('Array of app|email|webhook|slack');
            $table->jsonb('metadata')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('read_at')->nullable();

            $table->index(['recipient_id', 'read_at']);
            $table->index(['app', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
