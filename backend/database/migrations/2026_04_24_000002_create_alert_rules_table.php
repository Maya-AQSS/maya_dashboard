<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
            $table->timestampsTz();

            $table->index(['enabled', 'last_evaluated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_rules');
    }
};
