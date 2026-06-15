<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// ODOO_BRIDGE — Tabla temporal para almacenar sobreescrituras del perfil de empleado
// mientras Odoo no proporcione un API de escritura. Eliminar junto con MeEmployeeController,
// UpdateMeEmployeeRequest y la lógica de merge en EmployeeProfileReader cuando la
// integración con Odoo esté completa.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profile_overrides', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->unique()->index();
            $table->string('personal_email', 254)->nullable();
            $table->string('iban', 34)->nullable();
            $table->string('car_registration_number_1', 20)->nullable();
            $table->string('car_registration_number_2', 20)->nullable();
            $table->string('car_registration_number_3', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profile_overrides');
    }
};
