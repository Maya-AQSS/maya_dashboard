<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Restricts the alert_rules.query_sql field to a narrow safelist:
 *
 *   - Must be a SELECT statement (single statement, no stacked queries).
 *   - Banned tokens (case-insensitive, word-boundary): write/DDL verbs
 *     (INSERT/UPDATE/DELETE/DROP/TRUNCATE/CREATE/ALTER/GRANT/REVOKE/COPY),
 *     execution helpers (EXECUTE/CALL/PERFORM), filesystem/network
 *     functions (pg_read_file / pg_read_binary_file / pg_ls_dir / dblink),
 *     timing primitives (pg_sleep), locking (LOCK).
 *
 * The pgsql_logs DB role is also locked down (see
 * database/sql/log_mgmt_readonly_role.sql) — this rule is the API-boundary
 * defense layer that complements it. Both must remain in place.
 */
class SafeAlertQuery implements ValidationRule
{
    /** @var list<string> */
    private const BANNED_TOKENS = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'CREATE', 'ALTER',
        'GRANT', 'REVOKE', 'COPY', 'EXECUTE', 'CALL', 'PERFORM', 'LOCK',
        'pg_read_file', 'pg_read_binary_file', 'pg_ls_dir',
        'dblink', 'pg_sleep',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('El campo :attribute debe ser una cadena SQL.');
            return;
        }

        $sql = trim($value);

        if ($sql === '') {
            $fail('El campo :attribute no puede estar vacío.');
            return;
        }

        // Strip a single trailing semicolon, then reject any remaining one
        // (prevents stacked statements).
        $sql = rtrim($sql, ';');
        if (str_contains($sql, ';')) {
            $fail('La consulta no puede contener varios statements (no se permite ";").');
            return;
        }

        if (stripos($sql, 'SELECT') !== 0) {
            $fail('La consulta debe empezar por SELECT.');
            return;
        }

        // Strip SQL comments before token scanning so attackers cannot hide
        // banned verbs inside /* */ or -- comments.
        $stripped = (string) preg_replace('#/\*.*?\*/#s', ' ', $sql);
        $stripped = (string) preg_replace('/--[^\n]*/', ' ', $stripped);

        foreach (self::BANNED_TOKENS as $token) {
            if (preg_match('/\b' . preg_quote($token, '/') . '\b/i', $stripped) === 1) {
                $fail("La consulta contiene un token no permitido: {$token}.");
                return;
            }
        }
    }
}
