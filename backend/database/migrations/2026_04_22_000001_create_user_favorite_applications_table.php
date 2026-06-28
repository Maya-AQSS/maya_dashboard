<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * user_id  — UUID del usuario (varchar 255) desde Odoo vía FDW; sin FK (view).
 * application_id — bigint de maya_auth.applications vía FDW; sin FK (foreign table).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_favorite_applications', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 255);         // KC UUID
            $table->unsignedBigInteger('application_id');
            $table->timestamps();

            $table->unique(['user_id', 'application_id']);
            $table->index('user_id');
            $table->index('application_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_favorite_applications');
    }
};
