<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * user_id — UUID del usuario (varchar 255) desde Odoo vía FDW; sin FK (view).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_dashboard_layouts', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 255)->unique(); // KC UUID, un layout por usuario
            $table->json('layout');
            $table->timestamp('updated_at')->nullable();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_dashboard_layouts');
    }
};
