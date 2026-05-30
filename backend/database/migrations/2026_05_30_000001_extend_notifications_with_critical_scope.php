<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Add new columns
            $table->boolean('is_critical')->default(false)->after('metadata')->comment('Alert severity flag — true for severity in [critical, high]');
            $table->string('scope', 20)->default('user')->after('is_critical')->comment('Distribution scope: user, dashboard, or both');

            // Acknowledgement fields for cross-domain alert lifecycle
            $table->timestampTz('acknowledged_at')->nullable()->after('scope')->comment('When this alert was acknowledged');
            $table->uuid('acknowledged_by')->nullable()->after('acknowledged_at')->comment('Keycloak ID of user who acknowledged');

            // Resolution fields for cross-domain alert lifecycle
            $table->timestampTz('resolved_at')->nullable()->after('acknowledged_by')->comment('When this alert was resolved');
            $table->uuid('resolved_by')->nullable()->after('resolved_at')->comment('Keycloak ID of user who resolved');

            // Index for filtering by is_critical and scope
            $table->index('is_critical');
            $table->index('scope');
            $table->index(['is_critical', 'scope']);
            $table->index(['recipient_id', 'is_critical']);
        });

        // Make recipient_id nullable for dashboard-scoped notifications
        DB::statement('ALTER TABLE notifications ALTER COLUMN recipient_id DROP NOT NULL');
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['is_critical', 'scope']);
            $table->dropIndex(['recipient_id', 'is_critical']);
            $table->dropIndex('is_critical');
            $table->dropIndex('scope');
            $table->dropColumn('is_critical');
            $table->dropColumn('scope');
            $table->dropColumn('acknowledged_at');
            $table->dropColumn('acknowledged_by');
            $table->dropColumn('resolved_at');
            $table->dropColumn('resolved_by');
        });

        // Restore recipient_id NOT NULL
        DB::statement('ALTER TABLE notifications ALTER COLUMN recipient_id SET NOT NULL');
    }
};
