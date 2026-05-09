<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Partial index so EvaluateAlertRules (runs every 60s) only scans active rules.
        // A boolean B-tree has too low cardinality for PostgreSQL to choose; a partial
        // index on the true side is the correct approach here.
        DB::statement(
            'CREATE INDEX IF NOT EXISTS alert_rules_enabled_idx ON alert_rules (id) WHERE enabled = TRUE'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS alert_rules_enabled_idx');
    }
};
