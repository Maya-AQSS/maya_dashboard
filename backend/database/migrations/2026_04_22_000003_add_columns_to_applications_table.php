<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->text('description')->nullable()->after('slug');
            $table->string('traefik_url')->nullable()->after('description');
            $table->boolean('is_active')->default(true)->after('traefik_url');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['description', 'traefik_url', 'is_active']);
        });
    }
};
